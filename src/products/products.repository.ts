import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/common/interfaces/common.interfaces';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
    ) {
        super(
            productRepository.target,
            productRepository.manager,
            productRepository.queryRunner,
        );
    }

    async createProductWithImages(productDetails, imagesCdn): Promise<Product> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const product = queryRunner.manager.create(Product, {
                ...productDetails,
                status: Status.PUBLISHED,
                thumbnail_url: imagesCdn[0],
                images: imagesCdn.map((image) => {
                    const productImage = queryRunner.manager.create(
                        ProductImage,
                        {
                            url: image,
                        },
                    );
                    return productImage;
                }),
            });

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();

            return product;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateProductWithImages(
        uuid: string,
        toUpdate: UpdateProductDto,
        imagesCdn: string[],
    ): Promise<Product | null> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images, ...productDetails } = toUpdate;
        try {
            const product = await this.productRepository.preload({
                uuid,
                ...productDetails,
            });
            if (!product) {
                return null;
            }
            if (imagesCdn.length > 0) {
                const existingImages = await queryRunner.manager.find(
                    ProductImage,
                    {
                        where: { product: { uuid } },
                    },
                );
                if (existingImages.length > 0) {
                    await queryRunner.manager.delete(ProductImage, {
                        product: { uuid },
                    });
                }
                this.logger.debug(`Images to be saved: ${imagesCdn}`);
                product.thumbnail_url = imagesCdn[0];
                product.images = imagesCdn.map((image) =>
                    this.manager.create(ProductImage, { url: image }),
                );
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();

            return product;
        } catch (error) {
            this.logger.error('Error updating product', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            this.logger.log('Releasing queryRunner');
            await queryRunner.release();
        }
    }
}
