import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';

import { ProductRepository } from './products.repository';
import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService, ProductRepository],
    imports: [
        TypeOrmModule.forFeature([Product, ProductImage]),
        AuthModule,
        FilesModule,
    ],
    exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
