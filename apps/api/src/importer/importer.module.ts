import { Module } from '@nestjs/common';
import { WooCommerceImporterService } from './woocommerce-importer.service';
import { ImporterController } from './importer.controller';

@Module({
  controllers: [ImporterController],
  providers: [WooCommerceImporterService],
  exports: [WooCommerceImporterService],
})
export class ImporterModule {}
