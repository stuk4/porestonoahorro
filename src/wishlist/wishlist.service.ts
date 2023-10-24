import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistRepository } from './wishlist.repositroy';
import { User } from '../user-database/entities/user.entity';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { WishlistItem } from './entities/wishlist-item';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../products/products.repository';
import { UserProfile } from '../user-database/entities/user-profile.entity';

@Injectable()
export class WishlistService {
    private readonly logger = new Logger();
    constructor(
        private readonly wishlistRepository: WishlistRepository,
        @InjectRepository(WishlistItem)
        private readonly wishlistItemRepository: Repository<WishlistItem>,

        private readonly productRepository: ProductRepository,
    ) {}

    async create(createWishlistDto: CreateWishlistDto, user: User) {
        try {
            const wishlist = this.wishlistRepository.create({
                ...createWishlistDto,
                userProfile: user.userProfile,
            });
            const wishlistSaved = await this.wishlistRepository.save(wishlist);
            return wishlistSaved;
        } catch (error) {
            this.handleDBExceptions(error, 'create');
        }
    }

    async createWishlistItem(createWishlistItemDto: CreateWishlistItemDto) {
        try {
            const wishlist = await this.wishlistRepository.findOneBy({
                uuid: createWishlistItemDto.wishlistUuid,
            });
            if (!wishlist) {
                throw new NotFoundException('Wishlist not found');
            }

            const product = await this.productRepository.findOneBy({
                uuid: createWishlistItemDto.productUuid,
            });
            if (!product) {
                throw new NotFoundException('Product not found');
            }

            const wishlistItem = this.wishlistItemRepository.create({
                wishlist,
                product,
            });

            const wishlistItemSaved =
                await this.wishlistItemRepository.save(wishlistItem);

            return wishlistItemSaved;
        } catch (error) {
            this.handleDBExceptions(error, 'create');
        }
    }

    findAll() {
        return `This action returns all wishlist`;
    }

    findOne(id: number) {
        return `This action returns a #${id} wishlist`;
    }

    async update(
        uuid: string,
        updateWishlistDto: UpdateWishlistDto,
        userProfile: UserProfile,
    ) {
        try {
            const wishlist = await this.wishlistRepository.findOne({
                where: { uuid },
                relations: ['userProfile'],
            });

            if (!wishlist) {
                throw new NotFoundException('Wishlist not found');
            }

            if (wishlist.userProfile.uuid !== userProfile.uuid) {
                throw new ForbiddenException(
                    'You can only update your own wishlists',
                );
            }

            Object.assign(wishlist, updateWishlistDto);
            return this.wishlistRepository.save(wishlist);
        } catch (error) {
            this.handleDBExceptions(error, 'update');
        }
    }

    remove(id: number) {
        return `This action removes a #${id} wishlist`;
    }
    private handleDBExceptions(
        error: any,
        errorType: 'create' | 'update' | 'delete' | 'find' | 'login',
    ): never {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        // Si el error es una NotFoundException, simplemente lo relanzamos para menejarlo en de manera mas controlada
        if (error instanceof NotFoundException) {
            throw error;
        }
        // Duplicados en campos únicos
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(
            `Error on ${errorType} wishlist`,
        );
    }
}
