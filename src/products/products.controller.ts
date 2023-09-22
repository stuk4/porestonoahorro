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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Auth(Role.USER)
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
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
    @Auth(Role.ADMIN)
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(uuid, updateProductDto);
    }

    @Delete(':uuid')
    @Auth(Role.ADMIN)
    remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.productsService.remove(uuid);
    }
}
