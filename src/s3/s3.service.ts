import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const r2Endpoint = this.configService.get<string>('R2_ENDPOINT');
    const r2AccessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const r2SecretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');

    if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey || !bucketName) {
      throw new Error('Missing required R2 configuration. Please check your environment variables.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<{ key: string; url: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const key = `documents/${userId}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
        },
      });

      await this.s3Client.send(command);

      const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');
      if (!publicUrl) {
        throw new Error('R2_PUBLIC_URL not configured');
      }
      const url = `${publicUrl}/${key}`;
      
      this.logger.log(`File uploaded successfully: ${key}`);
      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error('Failed to upload file to storage');
    }
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack);
      throw new Error('Failed to generate file URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error('Failed to delete file from storage');
    }
  }
}
