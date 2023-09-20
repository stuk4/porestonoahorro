import {
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import { getPathOrOriginal } from './utils/get-path-or-original';
import { createThumbnailSize } from './utils/process-image';

@Injectable()
export class FilesService {
    private readonly s3BucketName: string;
    private readonly logger = new Logger(FilesService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly s3Client: S3Client,
    ) {
        this.s3BucketName = this.configService.get('CLOUDFLARE_R2_BUCKET');
    }
    async uploadTempFiles(
        files: Array<Express.Multer.File>,
        response: Response,
    ): Promise<string[]> {
        try {
            const uuidFile = uuid();
            const keys: string[] = files.map(
                (file) =>
                    `temp/product/${uuidFile}/${file.originalname.replace(
                        /\s+/g,
                        '',
                    )}`,
            );

            const sendPromises = keys.map((key, index) =>
                this.s3Client.send(
                    new PutObjectCommand({
                        Bucket: this.s3BucketName,
                        Key: key,
                        Body: files[index].buffer,
                        ContentType: files[index].mimetype,
                    }),
                ),
            );

            const results = await Promise.allSettled(sendPromises);

            const successfulKeys: string[] = [];
            let anyFailed = false;

            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'rejected') {
                    this.logger.error(
                        `Error uploading file ${files[i].originalname}`,
                    );
                    anyFailed = true;
                } else {
                    successfulKeys.push(keys[i]);
                }
            }

            if (successfulKeys.length === 0) {
                throw new InternalServerErrorException(
                    'Failed to upload all files.',
                );
            } else if (anyFailed) {
                response
                    .status(HttpStatus.PARTIAL_CONTENT)
                    .send(successfulKeys); // Partial Content
            } else {
                return successfulKeys; // OK
            }
        } catch (error) {
            this.logger.error(`Error uploading files: ${error.message}`);
            throw new InternalServerErrorException('Failed to upload files.');
        }
    }

    async moveToPermanentLocations(tempKeys: string[]): Promise<string[]> {
        if (tempKeys && tempKeys.length === 0) return [];

        const movePromises = tempKeys.map((tempKey) => {
            const permanentKey = tempKey.replace('temp/', '');
            return this.s3Client
                .send(
                    new CopyObjectCommand({
                        Bucket: this.s3BucketName,
                        CopySource: `${this.s3BucketName}/${tempKey}`,
                        Key: permanentKey,
                    }),
                )
                .then(() => {
                    this.logger.log(
                        `File moved from ${tempKey} to ${permanentKey} successfully.`,
                    );
                    return permanentKey;
                })
                .catch((error) => {
                    this.logger.error(
                        `Error moving file from ${tempKey} to permanent location: ${error.message}`,
                    );
                    throw tempKey; // Lanzamos el tempKey como error para recogerlo después
                });
        });
        const thumbnailImage = this.generateThmbnail(tempKeys[0]);
        const results = await Promise.allSettled([
            thumbnailImage,
            ...movePromises,
        ]);

        const permanentKeys: string[] = [];
        const failedKeys: string[] = [];

        for (const result of results) {
            if (result.status == 'fulfilled') {
                permanentKeys.push(result.value);
            } else {
                failedKeys.push(result.reason);
            }
        }

        // Si hay claves fallidas, borra las claves permanentes, debido a que no se movieron correctamente
        if (failedKeys.length > 0) {
            const deletePromises = permanentKeys.map((keyToDelete) => {
                return this.s3Client
                    .send(
                        new DeleteObjectCommand({
                            Bucket: this.s3BucketName,
                            Key: keyToDelete,
                        }),
                    )
                    .then(() => {
                        this.logger.log(
                            `File ${keyToDelete} deleted successfully due to move errors.`,
                        );
                    })
                    .catch((error) => {
                        this.logger.error(
                            `Error deleting file ${keyToDelete} after move errors: ${error.message}`,
                        );
                    });
            });
            await Promise.allSettled(deletePromises);
            throw new InternalServerErrorException(
                `Error moving the following files: ${failedKeys.join(', ')}.`,
            );
        }

        return permanentKeys.map(
            (key) => `${this.configService.get('CDN_URL')}/${key}`,
        );
    }
    async deleteFiles(keys: string[]): Promise<void> {
        const deletePromises = keys.map((key) => {
            return this.s3Client
                .send(
                    new DeleteObjectCommand({
                        Bucket: this.s3BucketName,
                        Key: getPathOrOriginal(key),
                    }),
                )
                .then(() => {
                    this.logger.log(`File ${key} deleted successfully.`);
                })
                .catch((error) => {
                    this.logger.error(
                        `Error deleting file ${key}: ${error.message}`,
                    );
                });
        });
        await Promise.allSettled(deletePromises);
    }

    private async generateThmbnail(key: string): Promise<string> {
        try {
            const { Body, ContentType } = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: this.s3BucketName,
                    Key: key,
                }),
            );
            const keySplited = key.split('/');
            const filename = keySplited[keySplited.length - 1];
            const permanentKey = key
                .replace('temp/', '')
                .replace(filename, `thumbnail/image.webp`);
            if (Body) {
                const byteArray = await Body.transformToByteArray();
                const thumbnailBuffer = await createThumbnailSize(byteArray);

                const uploaded = this.s3Client
                    .send(
                        new PutObjectCommand({
                            Bucket: this.s3BucketName,
                            Key: permanentKey,
                            ContentLength: thumbnailBuffer.length,
                            Body: thumbnailBuffer,

                            ContentType: ContentType,
                        }),
                    )
                    .then(() => {
                        this.logger.log(
                            `File moved from ${key} to ${permanentKey} successfully.`,
                        );
                        return permanentKey;
                    })
                    .catch((error) => {
                        this.logger.error(
                            `Error moving file from ${key} to permanent location: ${error.message}`,
                        );
                        throw key;
                    });
                return uploaded;
            } else {
                throw new InternalServerErrorException('No file body found');
            }
        } catch (err) {
            this.logger.error(err);
            throw new InternalServerErrorException('Error creating thumbnail.');
        }
    }
}
