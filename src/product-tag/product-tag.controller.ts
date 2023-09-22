import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { CreateProductTagDto } from './dto/create-product-tag.dto';
import { UpdateProductTagDto } from './dto/update-product-tag.dto';
import { Auth } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';

@Controller('product-tag')
export class ProductTagController {
    constructor(private readonly productTagService: ProductTagService) {}

    @Post()
    @Auth(Role.ADMIN)
    create(@Body() createProductTagDto: CreateProductTagDto) {
        return this.productTagService.create(createProductTagDto);
    }

    @Get()
    findAll() {
        return this.productTagService.findAll();
    }

    @Get(':id')
    @Auth(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.productTagService.findOne(+id);
    }

    @Patch(':id')
    @Auth(Role.ADMIN)
    update(
        @Param('id') id: string,
        @Body() updateProductTagDto: UpdateProductTagDto,
    ) {
        return this.productTagService.update(+id, updateProductTagDto);
    }

    @Delete(':id')
    @Auth(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.productTagService.remove(+id);
    }
}
