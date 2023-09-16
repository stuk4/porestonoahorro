import {
    MinLength,
    IsString,
    IsPositive,
    IsOptional,
    IsEnum,
    IsNumber,
    IsArray,
} from 'class-validator';
import { Status } from '../../common/interfaces/common.interfaces';

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
    @IsEnum(Status)
    status?: Status;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}
