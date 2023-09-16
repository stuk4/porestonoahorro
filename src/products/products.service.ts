import {
    BadRequestException,
    ConflictException,
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
import { ProductImage } from './entities';
import { FilesService } from 'src/files/files.service';
import { Status } from 'src/common/interfaces/common.interfaces';
import { ProductRepository } from './products.repository';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger();
    constructor(
        private readonly productRepository: ProductRepository,
        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,
        private readonly dataSource: DataSource,
        private readonly filesService: FilesService,
    ) {}

    async create(createProductDto: CreateProductDto) {
        const { images = [], ...productDetails } = createProductDto;
        let imagesCdn = [];
        try {
            if (images.length > 0) {
                imagesCdn =
                    await this.filesService.moveToPermanentLocations(images);
            }
            const product =
                await this.productRepository.createProductWithImages(
                    productDetails,
                    imagesCdn,
                );

            return {
                ...product,
                images: imagesCdn,
            };
        } catch (error) {
            if (images.length > 0) {
                this.filesService.deleteFiles(imagesCdn);
            }
            this.handleDBExceptions(error, 'create');
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { perPage = 10, page = 1 } = paginationDto;

        const [products, total] = await this.productRepository.findAndCount({
            where: { status: Status.PUBLISHED },
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
        const findOptions = {
            where: isUUID(term) ? { uuid: term } : { slug: term },
            relations: ['images'],
        };

        const product = await this.productRepository.findOne(findOptions);
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
        if (images.length == 0) {
            this.logger.error('At least one image is required');
            throw new BadRequestException('At least one image is required');
        }

        let imagesCdn: string[] = [];
        try {
            if (images && images.length > 0) {
                imagesCdn =
                    await this.filesService.moveToPermanentLocations(images);
            }

            const updatedProduct =
                await this.productRepository.updateProductWithImages(
                    uuid,
                    toUpdate,
                    imagesCdn,
                );
            if (!updatedProduct)
                throw new NotFoundException(`Product #${uuid} not found`);
            const { images: updatedImages, ...rest } = updatedProduct;

            return {
                ...rest,
                images: updatedImages.map(({ url }) => url),
            };
        } catch (error) {
            if (imagesCdn.length > 0) this.filesService.deleteFiles(imagesCdn);
            this.handleDBExceptions(error, 'update');
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
            this.handleDBExceptions(error, 'delete');
        }
    }
    private handleDBExceptions(
        error: any,
        errorType: 'create' | 'update' | 'delete' | 'find',
    ) {
        // Si el error es una NotFoundException, simplemente lo relanzamos
        if (error instanceof NotFoundException) {
            throw error;
        }
        // Duplicados en campos únicos
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(`Error on ${errorType} product`);
    }
}
