import { IsString, MinLength } from 'class-validator';

export class CreateWishlistDto {
    @IsString()
    @MinLength(3)
    name: string;
}
