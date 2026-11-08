import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ImporterModule } from './importer/importer.module';

@Module({
  imports: [PrismaModule, ImporterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
