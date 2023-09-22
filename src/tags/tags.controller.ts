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
import { Auth } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    @Auth(Role.USER)
    create(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.tagsService.findAll(paginationDto);
    }

    @Get(':uuid')
    @Auth(Role.ADMIN)
    findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.tagsService.findOne(uuid);
    }

    @Patch(':uuid')
    @Auth(Role.ADMIN)
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.update(uuid, updateTagDto);
    }

    @Delete(':uuid')
    @Auth(Role.ADMIN)
    remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.tagsService.remove(uuid);
    }
}
