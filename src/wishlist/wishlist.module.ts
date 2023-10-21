import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistRepository } from './wishlist.repositroy';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { ProductRepository } from '../products/products.repository';

@Module({
    controllers: [WishlistController],
    providers: [WishlistService, WishlistRepository, ProductRepository],
    imports: [
        TypeOrmModule.forFeature([Wishlist, WishlistItem]),
        AuthModule,
        ProductsModule,
    ],
    exports: [TypeOrmModule],
})
export class WishlistModule {}
