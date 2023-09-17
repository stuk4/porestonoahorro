import { MinLength, IsString, IsOptional, IsEnum } from 'class-validator';
import { Status } from '../../common/interfaces/common.interfaces';

export class CreateTagDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    description?: string;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}
