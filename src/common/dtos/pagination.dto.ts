import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Max(100)
    perPage?: number;

    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number;
}
