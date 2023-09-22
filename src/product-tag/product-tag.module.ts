import { Module } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTag } from './entities/product-tag.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [ProductTagController],
    imports: [TypeOrmModule.forFeature([ProductTag]), AuthModule],
    providers: [ProductTagService],
})
export class ProductTagModule {}
