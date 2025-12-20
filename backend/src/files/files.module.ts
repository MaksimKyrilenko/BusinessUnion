import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MinioModule,
  ],
  controllers: [FilesController],
})
export class FilesModule {}
