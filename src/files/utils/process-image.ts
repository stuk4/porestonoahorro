import * as sharp from 'sharp';

export const createThumbnailSize = async (
    byteArray: Uint8Array,
    size: number,
) => {
    try {
        const buffer = Buffer.from(byteArray);
        const bufferResized = await sharp(buffer)
            .resize(size, size, {
                fit: 'cover',
                position: 'centre',
            })
            .toBuffer();

        return bufferResized;
    } catch (error) {
        throw new Error(error);
    }
};
