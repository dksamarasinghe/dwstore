import * as path from 'path';
import { WooCommerceImporterService } from './woocommerce-importer.service';

async function main() {
  const service = new WooCommerceImporterService();
  const csvPath = path.resolve(__dirname, '../../../../wc-product-export-23-10-2026-1792752032411.csv');

  console.log(`Starting Dry Run Audit for: ${csvPath}`);
  const result = await service.dryRun(csvPath);

  console.log('\n======================================================');
  console.log('WOOCOMMERCE CSV DRY RUN VERIFICATION REPORT');
  console.log('======================================================');
  console.log(`Total Rows Parsed:           ${result.totalRows} (Expected: 531)`);
  console.log(`Header Column Count:         ${result.headerCount} (Expected: 152)`);
  console.log(`- Simple Products:           ${result.typeCounts.simple} (Expected: 369)`);
  console.log(`- Variable Parent Products:  ${result.typeCounts.variable} (Expected: 38)`);
  console.log(`- Child Variations:          ${result.typeCounts.variation} (Expected: 124)`);
  console.log(`Top-level Catalog Products:  ${result.topLevelCandidateCount} (Expected: 407)`);
  console.log(`Child Variations with Parent:${result.variationsWithParent} (Expected: 113)`);
  console.log(`Blank Parent (Review Queue): ${result.orphanVariationsCount} (Expected: 11)`);
  console.log(`Rows With Remote Images:     ${result.rowsWithImages} (Expected: 439)`);
  console.log(`Rows Without Images:         ${result.rowsWithoutImages} (Expected: 92)`);
  console.log(`Total Image URLs Found:      ${result.totalImageUrls}`);
  console.log(`Generated SKUs (WC-<id>):    ${result.generatedSkuCount} (Expected: 531)`);
  console.log('======================================================\n');
}

main().catch(console.error);
