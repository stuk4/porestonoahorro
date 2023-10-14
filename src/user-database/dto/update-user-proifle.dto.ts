import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Gender } from '../interfaces/user-databse.interfaces';
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsUrl()
    @IsOptional()
    facebook_profile?: string;

    @IsUrl()
    @IsOptional()
    instagram_profile?: string;

    @IsUrl()
    @IsOptional()
    x_profile?: string;

    @IsUrl()
    @IsOptional()
    tiktok_profile?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    images?: string[];
}
