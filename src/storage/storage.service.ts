import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Buffer } from 'node:buffer';

export interface StorageUploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadedStorageFile {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly bucket = process.env.S3_BUCKET!;

  private readonly s3 = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  async uploadFile(
    file: StorageUploadFile,
    folder: string,
  ): Promise<UploadedStorageFile> {
    const extension = extname(file.originalname);
    const key = `${folder}/${randomUUID()}${extension}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        key,
        url: this.getPublicUrl(key),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch {
      throw new InternalServerErrorException('Не удалось загрузить файл');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch {
      throw new InternalServerErrorException('Не удалось удалить файл');
    }
  }

  private getPublicUrl(key: string): string {
    return `${process.env.S3_PUBLIC_URL}/${key}`;
  }
}
