import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [FilesController],
    providers: [
        FilesService,
        {
            provide: S3Client,
            useFactory: (configService: ConfigService) => {
                return new S3Client({
                    region: 'auto',
                    endpoint: `https://${configService.get(
                        'CLOUDFLARE_ACCOUNT_ID',
                    )}.r2.cloudflarestorage.com`,

                    credentials: {
                        accessKeyId: configService.get(
                            'CLOUDFLARE_R2_ACCESS_KEY',
                        ),
                        secretAccessKey: configService.get(
                            'CLOUDFLARE_R2_SECRET_KEY',
                        ),
                    },
                });
            },
            inject: [ConfigService],
        },
    ],
    imports: [ConfigModule, AuthModule],
    exports: [FilesService],
})
export class FilesModule {}
