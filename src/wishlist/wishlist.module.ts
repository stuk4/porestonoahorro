import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    controllers: [WishlistController],
    providers: [WishlistService],
    imports: [TypeOrmModule.forFeature([Wishlist, WishlistItem])],
    exports: [TypeOrmModule],
})
export class WishlistModule {}
