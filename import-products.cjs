/**
 * DWstore - Full WooCommerce Product & Category & Brand Importer
 * Authoritative Ingestion Pipeline for DWstore.lk
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { createHash } = require('crypto');

const CSV_PATH = path.resolve(__dirname, 'wc-product-export-23-10-2026-1792752032411.csv');
const IMG_DIR = path.resolve(__dirname, 'apps/storefront/public/products/images');
const DATA_DIR = path.resolve(__dirname, 'apps/storefront/src/data');
const ALLOWED_HOSTS = ['www.dwstore.lk', 'dwstore.lk'];
const TIMEOUT_MS = 15000;
const MAX_BYTES = 10 * 1024 * 1024;

[IMG_DIR, DATA_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

function parseCsvLine(text) {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      values.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  values.push(cur);
  return values;
}

function col(cols, headers, name) {
  const idx = headers.indexOf(name);
  return idx !== -1 ? (cols[idx] || '').trim() : '';
}

function slugify(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

function parsePriceLKR(str) {
  if (!str || !str.trim()) return 0;
  const n = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function urlHash(url) {
  return createHash('md5').update(url).digest('hex').slice(0, 10);
}

function downloadImage(srcUrl) {
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(srcUrl); } catch { return resolve(null); }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) return resolve(null);

    const ext = path.extname(parsed.pathname).split('?')[0] || '.jpg';
    const filename = urlHash(srcUrl) + ext;
    const destPath = path.join(IMG_DIR, filename);
    const publicPath = `/products/images/${filename}`;

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      return resolve(publicPath);
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const timer = setTimeout(() => { req.destroy(); resolve(null); }, TIMEOUT_MS);

    const req = client.get(srcUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        clearTimeout(timer);
        return resolve(downloadImage(res.headers.location));
      }
      if (res.statusCode !== 200) {
        clearTimeout(timer);
        return resolve(null);
      }

      const tmp = destPath + '.tmp';
      const file = fs.createWriteStream(tmp);
      let bytes = 0;

      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > MAX_BYTES) { req.destroy(); file.destroy(); fs.unlink(tmp, () => {}); clearTimeout(timer); resolve(null); }
        else file.write(chunk);
      });

      res.on('end', () => {
        clearTimeout(timer);
        file.end(() => {
          if (bytes < 500) { fs.unlink(tmp, () => {}); return resolve(null); }
          fs.rename(tmp, destPath, (err) => resolve(err ? null : publicPath));
        });
      });

      res.on('error', () => { clearTimeout(timer); fs.unlink(tmp, () => {}); resolve(null); });
    });

    req.on('error', () => { clearTimeout(timer); resolve(null); });
  });
}

function createSemaphore(n) {
  let active = 0;
  const queue = [];
  return function acquire(fn) {
    return new Promise((res, rej) => {
      const run = () => { active++; fn().then(v => { active--; next(); res(v); }).catch(e => { active--; next(); rej(e); }); };
      if (active < n) run();
      else queue.push(run);
    });
    function next() { if (queue.length > 0) queue.shift()(); }
  };
}

async function main() {
  console.log('===========================================================');
  console.log('  DWstore.lk — WooCommerce Catalog Migration & Ingestion   ');
  console.log('===========================================================');
  console.log('Reading:', CSV_PATH);

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = [];
  let isFirstLine = true;
  let currentRecord = '';
  let insideQuote = false;
  const records = [];

  for await (let line of rl) {
    if (isFirstLine) {
      if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1);
      headers = parseCsvLine(line).map(h => h.replace(/^\uFEFF/, '').trim());
      isFirstLine = false;
      continue;
    }

    const quotesInLine = (line.match(/"/g) || []).length;
    if (insideQuote) {
      currentRecord += '\n' + line;
      if (quotesInLine % 2 === 1) {
        insideQuote = false;
        records.push(parseCsvLine(currentRecord));
        currentRecord = '';
      }
    } else {
      if (quotesInLine % 2 === 1) {
        insideQuote = true;
        currentRecord = line;
      } else {
        records.push(parseCsvLine(line));
      }
    }
  }

  console.log(`✅ Total CSV Records: ${records.length} (Headers: ${headers.length})`);

  // Categories & Brands
  const catMap = new Map();
  const brandMap = new Map();

  records.forEach(cols => {
    const catsRaw = col(cols, headers, 'Categories');
    if (catsRaw) {
      catsRaw.split(',').forEach(cPath => {
        const parts = cPath.split('>').map(p => decodeHtml(p.trim())).filter(Boolean);
        let parentSlug = null;
        parts.forEach((pName, idx) => {
          const slug = slugify(pName);
          if (!catMap.has(slug)) {
            catMap.set(slug, {
              id: slug,
              name: pName,
              slug,
              parentSlug,
              level: idx,
              productCount: 0,
              imageUrl: null,
            });
          }
          parentSlug = slug;
        });
      });
    }

    const bRaw = col(cols, headers, 'Brands');
    if (bRaw) {
      const bName = decodeHtml(bRaw);
      const bSlug = slugify(bName);
      if (bSlug && !brandMap.has(bSlug)) {
        brandMap.set(bSlug, { id: bSlug, name: bName, slug: bSlug, productCount: 0 });
      }
    }
  });

  // Products & Variations
  const productMap = new Map();
  const variationRows = [];
  const orphanVariations = [];

  records.forEach((cols, rowIdx) => {
    const wcId = col(cols, headers, 'ID');
    const type = col(cols, headers, 'Type');
    const name = decodeHtml(col(cols, headers, 'Name'));
    const status = col(cols, headers, 'Published');
    const sku = col(cols, headers, 'SKU') || `WC-${wcId}`;
    const regularPriceRaw = col(cols, headers, 'Regular price');
    const salePriceRaw = col(cols, headers, 'Sale price');
    const shortDesc = decodeHtml(col(cols, headers, 'Short description'));
    const desc = decodeHtml(col(cols, headers, 'Description'));
    const catsRaw = col(cols, headers, 'Categories');
    const brandRaw = decodeHtml(col(cols, headers, 'Brands'));
    const imagesRaw = col(cols, headers, 'Images');
    const parent = col(cols, headers, 'Parent');
    const stock = col(cols, headers, 'In stock?');
    const qty = col(cols, headers, 'Stock');
    const seoTitle = decodeHtml(col(cols, headers, 'Meta: _yoast_wpseo_title'));
    const seoDesc = decodeHtml(col(cols, headers, 'Meta: _yoast_wpseo_metadesc'));

    const regularPriceMinor = parsePriceLKR(regularPriceRaw);
    const salePriceMinor = salePriceRaw ? parsePriceLKR(salePriceRaw) : null;

    const imageUrls = imagesRaw
      ? imagesRaw.split(',').map(u => u.trim()).filter(u => u.startsWith('http'))
      : [];

    const categorySlugs = [];
    if (catsRaw) {
      catsRaw.split(',').forEach(cPath => {
        const parts = cPath.split('>').map(p => decodeHtml(p.trim())).filter(Boolean);
        if (parts.length > 0) {
          const leafSlug = slugify(parts[parts.length - 1]);
          categorySlugs.push(leafSlug);
          if (catMap.has(leafSlug)) {
            catMap.get(leafSlug).productCount++;
            if (!catMap.get(leafSlug).imageUrl && imageUrls[0]) {
              catMap.get(leafSlug).imageUrl = imageUrls[0];
            }
          }
        }
      });
    }

    const brandSlug = brandRaw ? slugify(brandRaw) : null;
    if (brandSlug && brandMap.has(brandSlug)) {
      brandMap.get(brandSlug).productCount++;
    }

    const productSlug = (slugify(name) || `product-${wcId}`) + `-${wcId}`;

    // Extract attributes (Attribute 1 to 5)
    const attributes = {};
    for (let i = 1; i <= 5; i++) {
      const aName = decodeHtml(col(cols, headers, `Attribute ${i} name`));
      const aVal = decodeHtml(col(cols, headers, `Attribute ${i} value(s)`));
      if (aName && aVal) {
        attributes[aName] = aVal;
      }
    }

    if (type === 'variation') {
      if (!parent || !parent.trim()) {
        orphanVariations.push({ wcId, name, rowNumber: rowIdx + 2 });
      } else {
        variationRows.push({
          wcId,
          parent,
          name,
          sku,
          regularPriceMinor,
          salePriceMinor,
          attributes,
          imageUrls,
          inStock: stock === '1',
          stockQty: qty ? parseInt(qty) : null,
        });
      }
      return;
    }

    // For parent products, parse parent attributes
    const parentAttributes = {};
    Object.entries(attributes).forEach(([k, v]) => {
      parentAttributes[k] = v.split(',').map(s => s.trim()).filter(Boolean);
    });

    productMap.set(wcId, {
      id: wcId,
      type,
      name,
      slug: productSlug,
      sku,
      status: status === '1' ? 'published' : 'draft',
      regularPriceMinor,
      salePriceMinor: (salePriceMinor && salePriceMinor > 0 && salePriceMinor < regularPriceMinor) ? salePriceMinor : null,
      minPriceMinor: 0,
      shortDescription: shortDesc,
      description: desc,
      categorySlugs: [...new Set(categorySlugs)],
      brand: brandRaw || null,
      brandSlug,
      attributes: parentAttributes,
      imageUrls,
      localImages: [],
      displayImage: imageUrls[0] || '/placeholder-product.png',
      inStock: stock === '1',
      stockQty: qty ? parseInt(qty) : null,
      seoTitle: seoTitle || name,
      seoDescription: seoDesc || shortDesc,
      variations: [],
      sourceSystem: 'woocommerce',
      sourceId: wcId,
    });
  });

  // Link variations
  variationRows.forEach(v => {
    const parentId = v.parent.replace(/^id:/, '').trim();
    const parentProduct = productMap.get(parentId);
    if (parentProduct) {
      const varDisplayImg = v.imageUrls[0] || parentProduct.displayImage;
      parentProduct.variations.push({
        id: v.wcId,
        sku: v.sku,
        name: v.name,
        regularPriceMinor: v.regularPriceMinor,
        salePriceMinor: v.salePriceMinor,
        attributes: v.attributes,
        imageUrls: v.imageUrls,
        displayImage: varDisplayImg,
        inStock: v.inStock,
        stockQty: v.stockQty,
      });

      // Update parent attributes
      if (!parentProduct.attributes) parentProduct.attributes = {};
      Object.entries(v.attributes).forEach(([attrName, attrVal]) => {
        if (!parentProduct.attributes[attrName]) {
          parentProduct.attributes[attrName] = [];
        }
        if (!parentProduct.attributes[attrName].includes(attrVal)) {
          parentProduct.attributes[attrName].push(attrVal);
        }
      });
    }
  });

  // Calculate minimum price for variable products!
  productMap.forEach(p => {
    if (p.type === 'variable' && p.variations.length > 0) {
      const validPrices = p.variations
        .map(v => v.salePriceMinor || v.regularPriceMinor)
        .filter(pr => pr && pr > 0);
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

      const validRegular = p.variations
        .map(v => v.regularPriceMinor)
        .filter(pr => pr && pr > 0);
      const minRegular = validRegular.length > 0 ? Math.min(...validRegular) : 0;

      const validSale = p.variations
        .map(v => v.salePriceMinor)
        .filter(pr => pr && pr > 0);
      const minSale = validSale.length > 0 ? Math.min(...validSale) : null;

      p.minPriceMinor = minPrice;
      p.regularPriceMinor = p.regularPriceMinor > 0 ? p.regularPriceMinor : (minRegular || minPrice);
      p.salePriceMinor = minSale || (minPrice < p.regularPriceMinor ? minPrice : null);
    } else {
      p.minPriceMinor = p.salePriceMinor || p.regularPriceMinor || 0;
    }
  });

  const products = [...productMap.values()];
  const categories = [...catMap.values()];
  const brands = [...brandMap.values()];

  console.log('\n-----------------------------------------------------------');
  console.log(`  Top-Level Products (Simple + Variable): ${products.length} (Expected: 407)`);
  console.log(`  Linked Child Variations:                ${variationRows.length} (Expected: 113)`);
  console.log(`  Orphan Child Variations (Flagged):      ${orphanVariations.length} (Expected: 11)`);
  console.log(`  Unique Categories Extracted:            ${categories.length}`);
  console.log(`  Unique Brands Extracted:                ${brands.length}`);
  console.log('-----------------------------------------------------------\n');

  // Check cached local images and assign
  products.forEach(p => {
    if (p.imageUrls.length > 0) {
      const ext = path.extname(new URL(p.imageUrls[0]).pathname).split('?')[0] || '.jpg';
      const filename = urlHash(p.imageUrls[0]) + ext;
      const destPath = path.join(IMG_DIR, filename);
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
        const publicPath = `/products/images/${filename}`;
        p.localImages = [publicPath];
        p.displayImage = publicPath;
      }
    }
    // Check variation images as well
    p.variations.forEach(v => {
      if (v.imageUrls.length > 0) {
        const ext = path.extname(new URL(v.imageUrls[0]).pathname).split('?')[0] || '.jpg';
        const filename = urlHash(v.imageUrls[0]) + ext;
        const destPath = path.join(IMG_DIR, filename);
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
          v.displayImage = `/products/images/${filename}`;
        }
      }
    });
  });

  // Write files
  fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'brands.json'), JSON.stringify(brands, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'orphan-variations.json'), JSON.stringify(orphanVariations, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'import-summary.json'), JSON.stringify({
    totalRows: records.length,
    totalProducts: products.length,
    totalVariations: variationRows.length,
    orphanVariations: orphanVariations.length,
    categoriesCount: categories.length,
    brandsCount: brands.length,
    importedAt: new Date().toISOString(),
  }, null, 2));

  console.log('\n🎉 ALL CATALOG DATA PERSISTED TO apps/storefront/src/data/!');
}

main().catch(console.error);
