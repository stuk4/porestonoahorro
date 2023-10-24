import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Auth, GetUser } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';
import { User } from '../user-database/entities/user.entity';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Post()
    @Auth(Role.USER)
    create(
        @Body() createWishlistDto: CreateWishlistDto,
        @GetUser() user: User,
    ) {
        return this.wishlistService.create(createWishlistDto, user);
    }

    @Post('item')
    @Auth(Role.USER)
    createWishlistItem(@Body() createWishlistItemDto: CreateWishlistItemDto) {
        return this.wishlistService.createWishlistItem(createWishlistItemDto);
    }

    @Get()
    findAll() {
        return this.wishlistService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.wishlistService.findOne(+id);
    }

    @Patch(':uuid')
    @Auth(Role.USER)
    update(
        @Param('uuid') uuid: string,
        @Body() updateWishlistDto: UpdateWishlistDto,
        @GetUser() user: User,
    ) {
        return this.wishlistService.update(
            uuid,
            updateWishlistDto,
            user.userProfile,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.wishlistService.remove(+id);
    }
}
