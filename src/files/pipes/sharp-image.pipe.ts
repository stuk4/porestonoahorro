import { Injectable, PipeTransform } from '@nestjs/common';

import * as sharp from 'sharp';

@Injectable()
export class SharpImagePipe implements PipeTransform {
    async transform(
        images: Express.Multer.File[],
    ): Promise<Express.Multer.File[]> {
        const newMimeType = 'image/webp';
        const effort = 2;

        const transformedFilesPromises = images.map(async (image, index) => {
            const transformedBuffer = await sharp(image.buffer)
                .resize(680, 680, { fit: 'cover', position: 'centre' })
                .webp({ effort: effort })
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
        const transformedImages = await Promise.all(transformedFilesPromises);
        return [...transformedImages];
    }
}
