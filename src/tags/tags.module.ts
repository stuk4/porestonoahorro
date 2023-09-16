import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';

@Module({
    controllers: [TagsController],
    imports: [TypeOrmModule.forFeature([Tag])],
    providers: [TagsService],
})
export class TagsModule {}
