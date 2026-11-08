import fs from 'fs';
import path from 'path';

function clearDir(dirPath) {
  let freed = 0;
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const curPath = path.join(dirPath, file);
      const stat = fs.statSync(curPath);
      if (stat.isDirectory()) {
        freed += clearDir(curPath);
        try { fs.rmdirSync(curPath); } catch (e) {}
      } else {
        freed += stat.size;
        fs.unlinkSync(curPath);
      }
    }
  } catch (e) {}
  return freed;
}

const cacheDir = path.join(process.cwd(), 'apps', 'storefront', '.next', 'cache');
console.log('Cleaning Next.js cache directory:', cacheDir);
const freed = clearDir(cacheDir);
console.log(`Successfully freed ${(freed / (1024 * 1024)).toFixed(2)} MB of cache storage.`);
