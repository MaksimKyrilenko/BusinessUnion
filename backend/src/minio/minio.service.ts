import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  
  // Bucket names
  readonly BUCKETS = {
    IMAGES: 'images',
    FILES: 'files',
    AVATARS: 'avatars',
    PROJECTS: 'projects',
  };

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'minio'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.initBuckets();
  }

  private async initBuckets() {
    for (const bucket of Object.values(this.BUCKETS)) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Bucket "${bucket}" created`);
          
          // Set public read policy for images and avatars
          if (bucket === this.BUCKETS.IMAGES || bucket === this.BUCKETS.AVATARS) {
            await this.setBucketPublicPolicy(bucket);
          }
        }
      } catch (error) {
        this.logger.error(`Error creating bucket "${bucket}":`, error.message);
      }
    }
  }

  private async setBucketPublicPolicy(bucket: string) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };
    
    await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    this.logger.log(`Public read policy set for bucket "${bucket}"`);
  }


  /**
   * Upload file to MinIO
   */
  async uploadFile(
    bucket: string,
    fileName: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const objectName = `${Date.now()}-${fileName}`;
    
    await this.minioClient.putObject(bucket, objectName, buffer, buffer.length, {
      'Content-Type': mimetype,
    });
    
    this.logger.log(`File uploaded: ${bucket}/${objectName}`);
    return objectName;
  }

  /**
   * Upload file from Express Multer
   */
  async uploadFromMulter(
    bucket: string,
    file: Express.Multer.File,
  ): Promise<{ objectName: string; url: string }> {
    const ext = file.originalname.split('.').pop();
    const objectName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    await this.minioClient.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    
    const url = this.getFileUrl(bucket, objectName);
    this.logger.log(`File uploaded: ${bucket}/${objectName}`);
    
    return { objectName, url };
  }

  /**
   * Get file URL
   */
  getFileUrl(bucket: string, objectName: string): string {
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'minio');
    const port = this.configService.get('MINIO_PORT', '9000');
    const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    
    // For external access, use public URL if configured
    const publicUrl = this.configService.get('MINIO_PUBLIC_URL');
    if (publicUrl) {
      return `${publicUrl}/${bucket}/${objectName}`;
    }
    
    return `${protocol}://${endpoint}:${port}/${bucket}/${objectName}`;
  }

  /**
   * Get presigned URL for private files
   */
  async getPresignedUrl(bucket: string, objectName: string, expiry = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(bucket, objectName, expiry);
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(bucket: string, objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, objectName);
      this.logger.log(`File deleted: ${bucket}/${objectName}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${bucket}/${objectName}:`, error.message);
    }
  }

  /**
   * Get file as stream
   */
  async getFile(bucket: string, objectName: string): Promise<NodeJS.ReadableStream> {
    return this.minioClient.getObject(bucket, objectName);
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(bucket: string, objectName: string) {
    return this.minioClient.statObject(bucket, objectName);
  }
}
