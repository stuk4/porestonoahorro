import {
    BadRequestException,
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
import { PaginationService } from '../common/services/pagination.service';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class WishlistService {
    private readonly logger = new Logger();
    constructor(
        private readonly wishlistRepository: WishlistRepository,
        @InjectRepository(WishlistItem)
        private readonly wishlistItemRepository: Repository<WishlistItem>,
        private readonly paginationService: PaginationService,
        private readonly productRepository: ProductRepository,
    ) {}

    async createWishlist(createWishlistDto: CreateWishlistDto, user: User) {
        try {
            const wishlistCount = await this.wishlistRepository.count({
                where: {
                    userProfile: {
                        uuid: user.userProfile.uuid,
                    },
                },
            });
            if (wishlistCount >= 20) {
                throw new BadRequestException(
                    'You can only create 20 wishlists',
                );
            }
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

    async findAllWishlistByUserProfile(userProfile: UserProfile) {
        try {
            const wishlists = await this.wishlistRepository.find({
                where: {
                    userProfile: {
                        uuid: userProfile.uuid,
                    },
                },
                take: 20,
            });

            for (const wishlist of wishlists) {
                const items = await this.wishlistItemRepository.find({
                    where: {
                        wishlist: {
                            uuid: wishlist.uuid,
                        },
                    },
                    relations: ['product'],
                    take: 4, //preview de 4 productos
                });
                wishlist.items = items;
            }

            return wishlists;
        } catch (error) {
            this.handleDBExceptions(error, 'find');
        }
    }

    async findAllWishlistItemsByWishlist(
        uuid: string,
        paginationDto: PaginationDto,
        userProfile: UserProfile,
    ) {
        try {
            const wishlistItems =
                await this.paginationService.paginate<WishlistItem>(
                    this.wishlistItemRepository,
                    paginationDto,
                    {
                        where: {
                            wishlist: {
                                uuid: uuid,
                                userProfile: {
                                    uuid: userProfile.uuid,
                                },
                            },
                        },
                        relations: ['product'],
                    },
                );
            return wishlistItems;
        } catch (error) {
            this.handleDBExceptions(error, 'find');
        }
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
