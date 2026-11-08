import * as fs from 'fs';
import * as readline from 'readline';

export interface CsvInspectionResult {
  totalRows: number;
  headerCount: number;
  typeCounts: {
    simple: number;
    variable: number;
    variation: number;
    [key: string]: number;
  };
  topLevelCandidateCount: number;
  variationCount: number;
  variationsWithParent: number;
  orphanVariationsCount: number;
  orphanVariations: Array<{ rowNumber: number; id: string; name: string }>;
  rowsWithImages: number;
  rowsWithoutImages: number;
  totalImageUrls: number;
  generatedSkuCount: number;
  sampleProducts: Array<{
    id: string;
    type: string;
    name: string;
    sku: string;
    regularPriceMinor: number;
    salePriceMinor?: number;
    categories: string[];
    images: string[];
  }>;
}

export class WooCommerceImporterService {
  /**
   * Safe CSV line splitter supporting RFC-4180 quotes
   */
  private parseCsvLine(text: string): string[] {
    const values: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
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

  /**
   * Converts regular/sale prices in LKR strings to integer minor units (cents)
   */
  private parsePriceMinor(priceStr: string): number {
    if (!priceStr || priceStr.trim() === '') return 0;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const floatVal = parseFloat(cleaned);
    if (isNaN(floatVal)) return 0;
    return Math.round(floatVal * 100);
  }

  /**
   * Generates deterministic SKU if missing
   */
  private generateSku(wcId: string): string {
    return `WC-${wcId}`;
  }

  /**
   * Perform dry-run audit and analysis on the WooCommerce CSV export
   */
  async dryRun(filePath: string): Promise<CsvInspectionResult> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers: string[] = [];
    let isFirstLine = true;
    let rowCount = 0;
    const typeCounts: Record<string, number> = { simple: 0, variable: 0, variation: 0 };
    const orphanVariations: Array<{ rowNumber: number; id: string; name: string }> = [];
    let variationsWithParent = 0;
    let rowsWithImages = 0;
    let rowsWithoutImages = 0;
    let totalImageUrls = 0;
    let generatedSkuCount = 0;
    const sampleProducts: any[] = [];

    let currentRecord = '';
    let insideQuote = false;

    const processRecord = (recordText: string) => {
      rowCount++;
      const cols = this.parseCsvLine(recordText);
      const idIdx = headers.indexOf('ID');
      const typeIdx = headers.indexOf('Type');
      const skuIdx = headers.indexOf('SKU');
      const nameIdx = headers.indexOf('Name');
      const parentIdx = headers.indexOf('Parent');
      const regularPriceIdx = headers.indexOf('Regular price');
      const salePriceIdx = headers.indexOf('Sale price');
      const categoriesIdx = headers.indexOf('Categories');
      const imagesIdx = headers.indexOf('Images');

      const id = idIdx !== -1 ? cols[idIdx] : '';
      const type = typeIdx !== -1 ? cols[typeIdx] : 'simple';
      const rawSku = skuIdx !== -1 ? cols[skuIdx] : '';
      const name = nameIdx !== -1 ? cols[nameIdx] : '';
      const parent = parentIdx !== -1 ? cols[parentIdx] : '';
      const rawRegular = regularPriceIdx !== -1 ? cols[regularPriceIdx] : '';
      const rawSale = salePriceIdx !== -1 ? cols[salePriceIdx] : '';
      const rawCategories = categoriesIdx !== -1 ? cols[categoriesIdx] : '';
      const rawImages = imagesIdx !== -1 ? cols[imagesIdx] : '';

      typeCounts[type] = (typeCounts[type] || 0) + 1;

      const sku = rawSku && rawSku.trim() !== '' ? rawSku.trim() : this.generateSku(id);
      if (!rawSku || rawSku.trim() === '') generatedSkuCount++;

      if (type === 'variation') {
        if (!parent || parent.trim() === '') {
          orphanVariations.push({ rowNumber: rowCount, id, name });
        } else {
          variationsWithParent++;
        }
      }

      if (rawImages && rawImages.trim() !== '') {
        rowsWithImages++;
        const urls = rawImages.split(',').map((u) => u.trim()).filter(Boolean);
        totalImageUrls += urls.length;
      } else {
        rowsWithoutImages++;
      }

      if (sampleProducts.length < 5 && type !== 'variation') {
        sampleProducts.push({
          id,
          type,
          name,
          sku,
          regularPriceMinor: this.parsePriceMinor(rawRegular),
          salePriceMinor: rawSale ? this.parsePriceMinor(rawSale) : undefined,
          categories: rawCategories.split(',').map((c) => c.trim()).filter(Boolean),
          images: rawImages ? rawImages.split(',').map((u) => u.trim()).filter(Boolean) : [],
        });
      }
    };

    for await (const line of rl) {
      if (isFirstLine) {
        headers = this.parseCsvLine(line);
        isFirstLine = false;
        continue;
      }

      const quotesInLine = (line.match(/"/g) || []).length;
      if (insideQuote) {
        currentRecord += '\n' + line;
        if (quotesInLine % 2 === 1) {
          insideQuote = false;
          processRecord(currentRecord);
          currentRecord = '';
        }
      } else {
        if (quotesInLine % 2 === 1) {
          insideQuote = true;
          currentRecord = line;
        } else {
          processRecord(line);
        }
      }
    }

    return {
      totalRows: rowCount,
      headerCount: headers.length,
      typeCounts: {
        simple: typeCounts.simple || 0,
        variable: typeCounts.variable || 0,
        variation: typeCounts.variation || 0,
      },
      topLevelCandidateCount: (typeCounts.simple || 0) + (typeCounts.variable || 0),
      variationCount: typeCounts.variation || 0,
      variationsWithParent,
      orphanVariationsCount: orphanVariations.length,
      orphanVariations,
      rowsWithImages,
      rowsWithoutImages,
      totalImageUrls,
      generatedSkuCount,
      sampleProducts,
    };
  }
}
