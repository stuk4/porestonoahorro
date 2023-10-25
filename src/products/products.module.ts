import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';

import { ProductRepository } from './products.repository';
import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { PaginationService } from '../common/services/pagination.service';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService, ProductRepository, PaginationService],
    imports: [
        TypeOrmModule.forFeature([Product, ProductImage]),
        AuthModule,
        FilesModule,
        CommonModule,
    ],
    exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
