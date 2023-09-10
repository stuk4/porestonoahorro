import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
@Injectable()
export class FilesService {
    private readonly s3BucketName: string;
    private readonly s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.configService.get(
            'CLOUDFLARE_ACCOUNT_ID',
        )}.r2.cloudflarestorage.com`,

        credentials: {
            accessKeyId: this.configService.get('CLOUDFLARE_R2_ACCESS_KEY'),
            secretAccessKey: this.configService.get('CLOUDFLARE_R2_SECRET_KEY'),
        },
    });
    constructor(private readonly configService: ConfigService) {
        this.s3BucketName = this.configService.get('CLOUDFLARE_R2_BUCKET');
    }
    async uploadFile(file: Express.Multer.File) {
        // await this.s3Client.send(new PutObjectCommand());

        const buckets = await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.s3BucketName,
                Key: `product/${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );
        console.log(buckets);
    }
}
