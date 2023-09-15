import * as sharp from 'sharp';

export const createThumbnailSize = async (byteArray: Uint8Array) => {
    try {
        const buffer = Buffer.from(byteArray);
        const bufferResized = await sharp(buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'centre',
            })
            .toBuffer();

        return bufferResized;
    } catch (error) {
        throw new Error(error);
    }
};
