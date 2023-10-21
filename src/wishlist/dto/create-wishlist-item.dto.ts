import { IsUUID } from 'class-validator';

export class CreateWishlistItemDto {
    @IsUUID()
    wishlistUuid: string;

    @IsUUID()
    productUuid: string;
}
