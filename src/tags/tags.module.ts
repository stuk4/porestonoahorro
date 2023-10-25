import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { PaginationService } from '../common/services/pagination.service';

@Module({
    controllers: [TagsController],
    imports: [TypeOrmModule.forFeature([Tag]), AuthModule, CommonModule],
    providers: [TagsService, PaginationService],
})
export class TagsModule {}
