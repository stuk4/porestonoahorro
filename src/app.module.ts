import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';

import { ThrottlerModule } from '@nestjs/throttler';
import { TagsModule } from './tags/tags.module';
import { ProductTagModule } from './product-tag/product-tag.module';
import { AuthModule } from './auth/auth.module';
@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            database: process.env.DB_NAME,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        ProductsModule,
        CommonModule,
        SeedModule,
        FilesModule,
        TagsModule,
        ProductTagModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
