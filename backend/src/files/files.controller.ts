import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { MinioService } from '../minio/minio.service';
import { memoryStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  // Upload regular files
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const forbiddenExtensions = ['.exe', '.sh', '.bat', '.cmd', '.msi', '.dll'];
        const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
        if (forbiddenExtensions.includes(ext)) {
          return cb(new HttpException('Запрещенный тип файла', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Файл не был загружен', HttpStatus.BAD_REQUEST);
    }

    const { objectName, url } = await this.minioService.uploadFromMulter(
      this.minioService.BUCKETS.FILES,
      file,
    );

    return {
      originalName: file.originalname,
      filename: objectName,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/files/download/${objectName}`,
      minioUrl: url,
    };
  }

  // Upload images
  @Post('upload/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new HttpException(
              'Поддерживаются только изображения формата JPG, JPEG, PNG, GIF и WEBP',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Изображение не было загружено', HttpStatus.BAD_REQUEST);
    }

    const { objectName, url } = await this.minioService.uploadFromMulter(
      this.minioService.BUCKETS.IMAGES,
      file,
    );

    return {
      originalName: file.originalname,
      filename: objectName,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/files/image/${objectName}`,
      minioUrl: url,
    };
  }


  // Upload avatar
  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new HttpException(
              'Поддерживаются только изображения формата JPG, JPEG, PNG и WEBP',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Аватар не был загружен', HttpStatus.BAD_REQUEST);
    }

    const { objectName, url } = await this.minioService.uploadFromMulter(
      this.minioService.BUCKETS.AVATARS,
      file,
    );

    return {
      originalName: file.originalname,
      filename: objectName,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/files/avatar/${objectName}`,
      minioUrl: url,
    };
  }

  // Upload project files (business plan, presentation)
  @Post('upload/project')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for project files
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new HttpException(
              'Поддерживаются только PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProjectFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Файл не был загружен', HttpStatus.BAD_REQUEST);
    }

    const { objectName, url } = await this.minioService.uploadFromMulter(
      this.minioService.BUCKETS.PROJECTS,
      file,
    );

    return {
      originalName: file.originalname,
      filename: objectName,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/files/project/${objectName}`,
      minioUrl: url,
    };
  }

  // Get file (download)
  @Get('download/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const exists = await this.minioService.fileExists(
        this.minioService.BUCKETS.FILES,
        filename,
      );
      if (!exists) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }

      const stats = await this.minioService.getFileStats(
        this.minioService.BUCKETS.FILES,
        filename,
      );
      const stream = await this.minioService.getFile(
        this.minioService.BUCKETS.FILES,
        filename,
      );

      res.setHeader('Content-Type', stats.metaData?.['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Ошибка при получении файла', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get image
  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const exists = await this.minioService.fileExists(
        this.minioService.BUCKETS.IMAGES,
        filename,
      );
      if (!exists) {
        throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
      }

      const stats = await this.minioService.getFileStats(
        this.minioService.BUCKETS.IMAGES,
        filename,
      );
      const stream = await this.minioService.getFile(
        this.minioService.BUCKETS.IMAGES,
        filename,
      );

      res.setHeader('Content-Type', stats.metaData?.['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      stream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Ошибка при получении изображения', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get avatar
  @Get('avatar/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const exists = await this.minioService.fileExists(
        this.minioService.BUCKETS.AVATARS,
        filename,
      );
      if (!exists) {
        throw new HttpException('Аватар не найден', HttpStatus.NOT_FOUND);
      }

      const stats = await this.minioService.getFileStats(
        this.minioService.BUCKETS.AVATARS,
        filename,
      );
      const stream = await this.minioService.getFile(
        this.minioService.BUCKETS.AVATARS,
        filename,
      );

      res.setHeader('Content-Type', stats.metaData?.['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      stream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Ошибка при получении аватара', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get project file
  @Get('project/:filename')
  async getProjectFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const exists = await this.minioService.fileExists(
        this.minioService.BUCKETS.PROJECTS,
        filename,
      );
      if (!exists) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }

      const stats = await this.minioService.getFileStats(
        this.minioService.BUCKETS.PROJECTS,
        filename,
      );
      const stream = await this.minioService.getFile(
        this.minioService.BUCKETS.PROJECTS,
        filename,
      );

      res.setHeader('Content-Type', stats.metaData?.['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Ошибка при получении файла', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete file
  @Delete(':bucket/:filename')
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
  ) {
    const validBuckets = Object.values(this.minioService.BUCKETS);
    if (!validBuckets.includes(bucket)) {
      throw new HttpException('Неверный bucket', HttpStatus.BAD_REQUEST);
    }

    await this.minioService.deleteFile(bucket, filename);
    return { message: 'Файл удален' };
  }
}
