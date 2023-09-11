import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { FilesService } from 'src/files/files.service';
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { images = [], ...productDetails } = createProductDto;
            const product = queryRunner.manager.create(Product, {
                ...productDetails,
                images: images.map((image) => {
                    const imageKey = queryRunner.manager.create(ProductImage, {
                        url: image,
                    });
                    return imageKey;
                }),
            });

            let imagesCdn = [];
            if (images.length > 0)
                imagesCdn =
                    await this.filesService.moveToPermanentLocations(images);

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

            this.handleDBExceptions(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { perPage = 10, page = 1 } = paginationDto;

        const [products, total] = await this.productRepository.findAndCount({
            take: perPage,
            skip: (page - 1) * perPage,
            relations: {
                images: true,
            },
        });
        const productPlain = products.map(({ images, ...rest }) => ({
            ...rest,
            images: images.map(({ url }) => url),
        }));

        return {
            data: productPlain,
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
        let product;
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
        const product = await this.productRepository.preload({
            uuid,
            ...toUpdate,
        });
        if (!product) throw new NotFoundException(`Product #${uuid} not found`);
        // Create query runner (atomic transactions)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (images) {
                await queryRunner.manager.delete(ProductImage, {
                    product: { uuid },
                });
                product.images = images.map((image) =>
                    this.productImageRepository.create({ url: image }),
                );
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            await queryRunner.release();
            // await this.productRepository.save(product);
            return this.findOnePlain(uuid);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.handleDBExceptions(error, true);
        }
    }

    async remove(uuid: string) {
        const product = await this.findOne(uuid);
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
        if (error.code === '23505') throw new BadRequestException(error.detail);
        this.logger.error(error);
        console.log(error);
        throw new InternalServerErrorException(
            `Error ${updating ? 'update' : 'create'} product`,
        );
    }
}
