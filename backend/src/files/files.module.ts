import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      dest: join(__dirname, '..', '..', 'uploads'),
    }),
  ],
  controllers: [FilesController],
})
export class FilesModule {} 