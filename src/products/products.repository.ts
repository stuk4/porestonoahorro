import { DataSource, In, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateProductDto } from './dto/update-product.dto';
import { Status } from '../common/interfaces/common.interfaces';
import { CreateProductDto } from './dto/create-product.dto';
import { Tag } from '../tags/entities/tag.entity';

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

    async createProductWithImages(
        productDetails: CreateProductDto,
        imagesCdn: string[],
    ): Promise<Product> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images, tags: tagsUUIDs, ...productDetail } = productDetails;

        try {
            const tags = await queryRunner.manager.findBy(Tag, {
                uuid: In(tagsUUIDs),
            });
            const product = queryRunner.manager.create(Product, {
                ...productDetail,
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
                tags,
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
        const { images, tags: tagsUUIDs, ...productDetails } = toUpdate;
        try {
            const product = await queryRunner.manager.findOne(Product, {
                where: { uuid },
                relations: ['tags', 'images'],
            });

            if (!product) {
                return null;
            }

            // Actualiza las propiedades básicas del producto
            Object.assign(product, productDetails);

            const tags = await queryRunner.manager.findBy(Tag, {
                uuid: In(tagsUUIDs),
            });

            // Se actualizan tags al producto
            product.tags = tags;

            if (imagesCdn && imagesCdn.length > 0) {
                if (images && images.length > 0) {
                    await queryRunner.manager.delete(ProductImage, {
                        product: { uuid },
                    });
                }

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
