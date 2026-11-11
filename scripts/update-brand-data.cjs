const fs = require('fs');
const path = require('path');

const brandsJsonPath = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', 'brands.json');
const realBrandsTsPath = path.join(process.cwd(), 'apps', 'admin', 'src', 'data', 'realBrands.ts');

const brands = JSON.parse(fs.readFileSync(brandsJsonPath, 'utf-8'));

const topSlugs = ['aspor', 'remax', 'jbl', 'anker', 'baseus', 'joyroom', 'lenovo', 'mi', 'sony', 'samsung', 'sandisk', 'ugreen', 'celebrat', 'bwoo', 'ldnio', 'kingston', 'tplink', 'hikvision-ezviz-hikvision'];

const updatedBrands = brands.map((b) => {
  const logoPath = `/media/brands/${b.slug}-logo.svg`;
  const isTop = topSlugs.includes(b.slug) || (b.productCount && b.productCount >= 5);
  return {
    ...b,
    logo: logoPath,
    featured: isTop,
  };
});

fs.writeFileSync(brandsJsonPath, JSON.stringify(updatedBrands, null, 2), 'utf-8');

// Also update realBrands.ts for admin
const tsContent = `import { BrandItem } from '../types';

export const realBrands: BrandItem[] = ${JSON.stringify(
  updatedBrands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    productCount: b.productCount || 0,
    featured: b.featured !== false,
    status: 'Active',
    description: '',
  })),
  null,
  2
)};
`;

fs.writeFileSync(realBrandsTsPath, tsContent, 'utf-8');
console.log('Successfully updated brands.json and realBrands.ts with all 56 brand logos!');
