const fs = require('fs');
const path = require('path');

const products = require('../apps/storefront/src/data/products.json');
const categories = require('../apps/storefront/src/data/categories.json');
const catMap = {};
categories.forEach(c => { catMap[c.slug] = c.name; });

// Calculate category counts
const catCounts = {};
products.forEach(p => {
  const primarySlug = p.categorySlugs && p.categorySlugs[0];
  const catName = catMap[primarySlug] || 'Other Gadgets';
  catCounts[catName] = (catCounts[catName] || 0) + 1;
});

const convertedProducts = products.map(p => {
  const regularPrice = Math.round((p.regularPriceMinor || 0) / 100);
  const salePrice = Math.round((p.salePriceMinor || p.minPriceMinor || p.regularPriceMinor || 0) / 100);
  const primarySlug = p.categorySlugs && p.categorySlugs[0];
  const catName = catMap[primarySlug] || 'Other Gadgets';

  let stock = p.stockQty !== null && p.stockQty !== undefined ? p.stockQty : (p.inStock ? 35 : 0);
  let status = !p.inStock ? 'Out of stock' : stock <= 10 ? 'Low stock' : 'Active';

  // Extract attributes
  const attrs = [];
  if (p.attributes && typeof p.attributes === 'object') {
    Object.keys(p.attributes).forEach(k => {
      const val = Array.isArray(p.attributes[k]) ? p.attributes[k].join(', ') : String(p.attributes[k]);
      attrs.push({ name: k, values: val });
    });
  }

  return {
    id: String(p.id),
    name: p.name,
    sku: p.sku || 'WC-' + p.id,
    brand: p.brand || 'DWstore',
    category: catName,
    regularPrice: regularPrice || salePrice,
    salePrice: salePrice || regularPrice || 1500,
    stock: stock,
    status: status,
    salesCount: Math.floor(Math.random() * 45) + 5,
    rating: 4.8,
    image: p.displayImage || (p.imageUrls && p.imageUrls[0]) || '',
    shortDesc: p.shortDescription || '',
    description: p.description || '',
    attributes: attrs
  };
});

const convertedCategories = categories.map((c, idx) => ({
  id: 'cat-' + (idx + 1),
  name: c.name,
  slug: c.slug,
  productCount: catCounts[c.name] || 0,
  icon: 'layers',
  status: 'Active',
  featured: (catCounts[c.name] || 0) > 10
})).sort((a, b) => b.productCount - a.productCount);

const outContent = `// Auto-generated from WooCommerce Export CSV (407 Products)
import { ProductItem, CategoryItem } from '../types';

export const realProducts: ProductItem[] = ${JSON.stringify(convertedProducts, null, 2)};

export const realCategories: CategoryItem[] = ${JSON.stringify(convertedCategories, null, 2)};
`;

const dest = path.resolve(__dirname, '../apps/admin/src/data/realCatalog.ts');
fs.writeFileSync(dest, outContent, 'utf8');
console.log('Successfully written to', dest);
console.log('Products:', convertedProducts.length, 'Categories:', convertedCategories.length);
