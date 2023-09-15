import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Not, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { FilesService } from 'src/files/files.service';
import { ProductStatus } from './entities/product.entity';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,
        private readonly dataSource: DataSource,
        private readonly filesService: FilesService,
    ) {}

    async create(createProductDto: CreateProductDto) {
        const { images = [], ...productDetails } = createProductDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let imagesCdn = [];
        try {
            if (images.length > 0)
                imagesCdn =
                    await this.filesService.moveToPermanentLocations(images);
            const product = queryRunner.manager.create(Product, {
                ...productDetails,
                status: ProductStatus.PUBLISHED,
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
            await queryRunner.release();

            return {
                ...product,
                images: imagesCdn,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            if (images.length > 0) {
                this.filesService.deleteFiles(imagesCdn);
            }
            this.handleDBExceptions(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { perPage = 10, page = 1 } = paginationDto;

        const [products, total] = await this.productRepository.findAndCount({
            where: { status: ProductStatus.PUBLISHED },
            take: perPage,
            skip: (page - 1) * perPage,
        });

        return {
            data: products,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / perPage),
                has_prev_page: page > 1,
                has_next_page: page < Math.ceil(total / perPage),
            },
        };
    }

    async findOne(term: string) {
        let product: Product;
        if (isUUID(term)) {
            product = await this.productRepository.findOneBy({ uuid: term });
        } else {
            product = await this.productRepository.findOneBy({ slug: term });
        }

        if (!product)
            throw new NotFoundException(`Product  with term ${term} not found`);

        return product;
    }
    async findOnePlain(term: string) {
        const product = await this.findOne(term);
        const { images = [], ...rest } = product;
        return { ...rest, images: images.map(({ url }) => url) };
    }
    async update(uuid: string, updateProductDto: UpdateProductDto) {
        const { images, ...toUpdate } = updateProductDto;

        const existingProductWithSlug = await this.productRepository.findOne({
            where: {
                title: toUpdate.title,
                uuid: Not(uuid), // Exclude current product
            },
        });

        if (existingProductWithSlug) {
            throw new ConflictException(
                'This title is already in use by another product.',
            );
        }
        const product = await this.productRepository.preload({
            uuid,
            ...toUpdate,
        });
        if (!product) throw new NotFoundException(`Product #${uuid} not found`);
        // Create query runner (atomic transactions)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let imagesCdn: string[] = [];
        try {
            let existingImages: ProductImage[] = [];
            if (images && images.length > 0) {
                existingImages = await queryRunner.manager.find(ProductImage, {
                    where: { product: { uuid } },
                });

                await queryRunner.manager.delete(ProductImage, {
                    product: { uuid },
                });

                imagesCdn =
                    await this.filesService.moveToPermanentLocations(images);
                product.thumbnail_url = imagesCdn[0];
                product.images = imagesCdn.map((image) =>
                    this.productImageRepository.create({ url: image }),
                );
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            await queryRunner.release();
            if (images && existingImages.length > 0)
                await this.filesService.deleteFiles(
                    existingImages.map(({ url }) => url),
                );

            return this.findOnePlain(uuid);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            if (imagesCdn.length > 0) this.filesService.deleteFiles(imagesCdn);
            this.handleDBExceptions(error, true);
        }
    }

    async remove(uuid: string) {
        const product = await this.findOne(uuid);
        const imageKeys = product.images.map(({ url }) => url);
        this.filesService.deleteFiles(imageKeys);
        await this.productRepository.remove(product);
    }

    async deleteAllProducts() {
        const query = this.productRepository.createQueryBuilder('product');
        try {
            return await query.delete().where({}).execute();
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }
    private handleDBExceptions(error: any, updating = false) {
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(
            `Error ${updating ? 'update' : 'create'} product`,
        );
    }
}
