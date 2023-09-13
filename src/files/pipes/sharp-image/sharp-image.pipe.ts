import { Injectable, PipeTransform } from '@nestjs/common';

import * as sharp from 'sharp';

@Injectable()
export class SharpImagePipe implements PipeTransform {
    async transform(
        images: Express.Multer.File[],
    ): Promise<Express.Multer.File[]> {
        const newMimeType = 'image/webp';

        const tempPreviewImage = await sharp(images[0].buffer)
            .resize(1200, 630, { fit: 'cover', position: 'centre' })
            .webp({ effort: 2 })
            .toBuffer();
        // TODO: verificar tamano de imagen
        const tempThumbnailImage = await sharp(images[0].buffer)
            .resize(500, 500, {
                fit: 'cover',
                position: 'centre',
            })
            .webp({ effort: 2 })
            .toBuffer();
        const previewImage = {
            ...images[0],
            buffer: tempPreviewImage,
            size: tempPreviewImage.length,
            mimetype: newMimeType,
            originalname: `preview/image.webp`,
        } as Express.Multer.File;
        const thumbnailImage = {
            ...images[0],
            buffer: tempThumbnailImage,
            size: tempThumbnailImage.length,
            mimetype: newMimeType,
            originalname: `thumbnail/image.webp`,
        } as Express.Multer.File;

        const transformedFilesPromises = images.map(async (image, index) => {
            const transformedBuffer = await sharp(image.buffer)
                .resize(1000, 1000, { fit: 'cover', position: 'centre' })
                .webp({ effort: 2 })
                .toBuffer();

            // Cambiar la extensión del archivo a .webp
            const newOriginalName = `image-${index + 1}` + '.webp';

            return {
                ...image,
                mimetype: newMimeType,
                size: transformedBuffer.length,
                originalname: newOriginalName,
                buffer: transformedBuffer,
            } as Express.Multer.File;
        });
        const files = await Promise.all(transformedFilesPromises);
        return [previewImage, thumbnailImage, ...files];
    }
}
