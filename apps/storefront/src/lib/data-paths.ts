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

export function getPersistentBackupPath(filename: string): string {
  const baseName = path.basename(filename, '.json');
  return path.join(process.cwd(), `${baseName}-persistent-backup.json`);
}

export function readDataJson<T = any>(filename: string, defaultValue: T): T {
  try {
    const filePath = getDataFilePath(filename);
    let data: any = null;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(content);
    } else {
      data = defaultValue;
    }

    // Check persistent live backup (protects against git pull overwrites on VPS)
    try {
      const backupPath = getPersistentBackupPath(filename);
      if (fs.existsSync(backupPath)) {
        const backupContent = fs.readFileSync(backupPath, 'utf-8');
        const backupData = JSON.parse(backupContent);

        if (Array.isArray(data) && Array.isArray(backupData)) {
          const existingIds = new Set(data.map((item: any) => String(item.id || item.sku || item.slug)));
          const missingFromData = backupData.filter(
            (item: any) => !existingIds.has(String(item.id || item.sku || item.slug))
          );
          if (missingFromData.length > 0) {
            data = [...missingFromData, ...data];
            // Resave to primary file so it's always complete
            try {
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            } catch {}
          }
        } else if (data && typeof data === 'object' && backupData && typeof backupData === 'object') {
          data = { ...data, ...backupData };
        }
      }
    } catch (e) {
      console.warn(`[DataPaths] Warning checking backup for ${filename}:`, e);
    }

    return (data !== null ? data : defaultValue) as T;
  } catch (err) {
    console.error(`[DataPaths] Error reading ${filename}:`, err);
  }
  return defaultValue;
}

export function writeDataJson(filename: string, data: any): boolean {
  try {
    const filePath = getDataFilePath(filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonStr, 'utf-8');

    // If both directory trees exist in monorepo, mirror save so both locations stay in sync
    const p1 = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', filename);
    const p2 = path.join(process.cwd(), 'src', 'data', filename);
    const alt = filePath === p1 ? p2 : p1;
    if (fs.existsSync(path.dirname(alt))) {
      try {
        fs.writeFileSync(alt, jsonStr, 'utf-8');
      } catch {}
    }

    // Always mirror to persistent live backup (which is ignored by Git)
    try {
      const backupPath = getPersistentBackupPath(filename);
      fs.writeFileSync(backupPath, jsonStr, 'utf-8');
    } catch (e) {
      console.warn(`[DataPaths] Failed to write backup for ${filename}:`, e);
    }

    return true;
  } catch (err) {
    console.error(`[DataPaths] Error writing ${filename}:`, err);
    return false;
  }
}

