/**
 * CSV Utilities for DWstore Admin
 * Handles robust RFC-4180 compliant CSV export and import.
 */

export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  // Normalize line endings
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else if (c === '"') {
        inQuotes = false;
      } else {
        row[row.length - 1] += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push('');
      } else if (c === '\n') {
        result.push(row.map(cell => cell.trim()));
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    result.push(row.map(cell => cell.trim()));
  }

  // Filter out empty rows
  return result.filter(r => r.some(cell => cell !== ''));
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
): void {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map(row => row.map(escapeCell).join(','));
  const content = [headerLine, ...rowLines].join('\r\n');

  // \uFEFF is UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
