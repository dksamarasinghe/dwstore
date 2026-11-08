import { Controller, Post, Get, Body } from '@nestjs/common';
import { WooCommerceImporterService } from './woocommerce-importer.service';
import * as path from 'path';

@Controller('api/v1/admin/imports')
export class ImporterController {
  constructor(private readonly importerService: WooCommerceImporterService) {}

  @Post('dry-run')
  async runDryRun(@Body('filePath') inputFilePath?: string) {
    const targetPath = inputFilePath || path.resolve(process.cwd(), '../../wc-product-export-23-10-2026-1792752032411.csv');
    const result = await this.importerService.dryRun(targetPath);
    return {
      success: true,
      data: result,
    };
  }

  @Get('summary')
  async getSummary() {
    const targetPath = path.resolve(process.cwd(), '../../wc-product-export-23-10-2026-1792752032411.csv');
    const result = await this.importerService.dryRun(targetPath);
    return {
      success: true,
      summary: {
        totalRows: result.totalRows,
        simple: result.typeCounts.simple,
        variableParents: result.typeCounts.variable,
        variations: result.typeCounts.variation,
        flaggedOrphanVariations: result.orphanVariationsCount,
        rowsWithImages: result.rowsWithImages,
        rowsWithoutImages: result.rowsWithoutImages,
      },
    };
  }
}
