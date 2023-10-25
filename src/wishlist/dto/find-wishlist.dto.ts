import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class FindWishlistDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Max(20)
    take: number;
}
