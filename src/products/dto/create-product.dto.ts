import {
    MinLength,
    IsString,
    IsPositive,
    IsOptional,
    IsEnum,
    IsNumber,
    IsArray,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
    @IsString()
    @MinLength(2)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}
