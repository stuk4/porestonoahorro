import { Module } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTag } from './entities/product-tag.entity';

@Module({
    controllers: [ProductTagController],
    imports: [TypeOrmModule.forFeature([ProductTag])],
    providers: [ProductTagService],
})
export class ProductTagModule {}
