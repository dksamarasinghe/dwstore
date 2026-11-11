import path from 'path';
import fs from 'fs';

export function getDataFilePath(filename: string): string {
  const p1 = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', filename);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), 'src', 'data', filename);
  if (fs.existsSync(p2)) return p2;
  if (fs.existsSync(path.join(process.cwd(), 'apps', 'storefront'))) {
    return p1;
  }
  return p2;
}

export function readDataJson<T = any>(filename: string, defaultValue: T): T {
  try {
    const filePath = getDataFilePath(filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[DataPaths] Error reading ${filename}:`, err);
  }
  return defaultValue;
}

export function writeDataJson(filename: string, data: any): boolean {
  try {
    const filePath = getDataFilePath(filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // If both directory trees exist in monorepo, mirror save so both locations stay in sync
    const p1 = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', filename);
    const p2 = path.join(process.cwd(), 'src', 'data', filename);
    const alt = filePath === p1 ? p2 : p1;
    if (fs.existsSync(path.dirname(alt))) {
      try {
        fs.writeFileSync(alt, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
    }
    return true;
  } catch (err) {
    console.error(`[DataPaths] Error writing ${filename}:`, err);
    return false;
  }
}
