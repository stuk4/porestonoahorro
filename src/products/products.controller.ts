import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    UseInterceptors,
    UploadedFiles,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
    Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SharpImagePipe } from '../files/pipes/sharp-image.pipe';
import { Response } from 'express';
import { User } from '../user-database/entities/user.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Auth(Role.USER)
    create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
        return this.productsService.create(createProductDto, user.userProfile);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    @Get(':term')
    findOne(@Param('term') term: string) {
        return this.productsService.findOnePlain(term);
    }

    @Patch(':uuid')
    @Auth(Role.USER)
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.update(
            uuid,
            updateProductDto,
            user.userProfile,
        );
    }

    @Post('files')
    @Auth(Role.USER)
    @UseInterceptors(FilesInterceptor('files', 3))
    uploadTempProductImage(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
            SharpImagePipe,
        )
        files: Array<Express.Multer.File>,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.productsService.uploadTempProductImages(files, response);
    }

    @Delete(':uuid')
    @Auth(Role.ADMIN)
    remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.productsService.remove(uuid);
    }
}
