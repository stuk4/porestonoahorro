import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    create(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.tagsService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) uuid: string) {
        return this.tagsService.findOne(uuid);
    }

    @Patch(':uuid')
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.update(uuid, updateTagDto);
    }

    @Delete(':uuid')
    remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.tagsService.remove(uuid);
    }
}
