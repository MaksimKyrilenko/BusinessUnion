import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  
  // Путь для хранения загруженных файлов
  private readonly uploadDir = join(__dirname, '..', '..', 'uploads');
  private readonly imageDir = join(this.uploadDir, 'images');
  private readonly fileDir = join(this.uploadDir, 'files');
  
  constructor() {
    // Создаем директории для хранения файлов, если они не существуют
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(this.imageDir);
    this.ensureDirectoryExists(this.fileDir);
  }
  
  // Загрузка обычных файлов
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(__dirname, '..', '..', 'uploads', 'files'));
        },
        filename: (req, file, cb) => {
          // Создаем уникальное имя файла
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB лимит размера файла
      },
      fileFilter: (req, file, cb) => {
        // Запрещаем загрузку исполняемых файлов в целях безопасности
        const forbiddenExtensions = ['.exe', '.sh', '.bat', '.cmd', '.msi', '.dll'];
        if (forbiddenExtensions.includes(extname(file.originalname).toLowerCase())) {
          return cb(new HttpException('Запрещенный тип файла', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('Файл не был загружен', HttpStatus.BAD_REQUEST);
    }
    
    // Формируем относительный путь для доступа к файлу через API
    const relativePath = `/api/files/download/${file.filename}`;
    
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: relativePath
    };
  }
  
  // Загрузка изображений
  @Post('upload/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(__dirname, '..', '..', 'uploads', 'images'));
        },
        filename: (req, file, cb) => {
          // Создаем уникальное имя файла
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB лимит для изображений
      },
      fileFilter: (req, file, cb) => {
        // Разрешаем только изображения
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new HttpException('Поддерживаются только изображения формата JPG, JPEG, PNG, GIF и WEBP', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('Изображение не было загружено', HttpStatus.BAD_REQUEST);
    }
    
    // Формируем относительный путь для доступа к изображению через API
    const relativePath = `/api/files/image/${file.filename}`;
    
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: relativePath
    };
  }
  
  // Получение загруженного файла
  @Get('download/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(this.fileDir, filename);
    
    try {
      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }
      
      // Отправляем файл как вложение
      return res.download(filePath, filename);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка при получении файла', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Получение загруженного изображения
  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const imagePath = join(this.imageDir, filename);
    
    try {
      // Проверяем существование изображения
      if (!fs.existsSync(imagePath)) {
        throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
      }
      
      // Определяем тип содержимого (MIME-тип)
      const ext = extname(filename).toLowerCase();
      let contentType = 'image/jpeg'; // По умолчанию
      
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      
      // Отправляем изображение с соответствующим типом содержимого
      res.setHeader('Content-Type', contentType);
      return res.sendFile(imagePath);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка при получении изображения', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Вспомогательный метод для создания директории, если она не существует
  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
} 