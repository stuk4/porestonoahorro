import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Status } from '../common/interfaces/common.interfaces';

@Injectable()
export class TagsService {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}
    async create(createTagDto: CreateTagDto) {
        try {
            const tag = this.tagRepository.create(createTagDto);
            // FIXME: TEMPRORAL
            tag.status = Status.PUBLISHED;
            const createdTag = await this.tagRepository.save(tag);
            return createdTag;
        } catch (error) {
            this.handleDBExceptions(error, 'create');
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { perPage = 10, page = 1 } = paginationDto;

        const [tags, total] = await this.tagRepository.findAndCount({
            where: { status: Status.PUBLISHED },
            take: perPage,
            skip: (page - 1) * perPage,
        });

        return {
            data: tags,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / perPage),
                has_prev_page: page > 1,
                has_next_page: page < Math.ceil(total / perPage),
            },
        };
    }

    async findOne(uuid: string) {
        const tag = await this.tagRepository.findOneBy({ uuid });
        if (!tag) {
            throw new NotFoundException(`Tag with uuid: ${uuid} not found`);
        }

        return tag;
    }

    async update(uuid: string, updateTagDto: UpdateTagDto) {
        const tag = await this.tagRepository.preload({
            uuid,
            ...updateTagDto,
        });
        if (!tag) {
            throw new NotFoundException(`Tag with uuid: ${uuid} not found`);
        }
        try {
            const updatedTag = await this.tagRepository.save(tag);
            return updatedTag;
        } catch (error) {
            this.handleDBExceptions(error, 'update');
        }
    }

    remove(uuid: string) {
        return `This action removes a #${uuid} tag`;
    }
    private handleDBExceptions(
        error: any,
        errorType: 'create' | 'update' | 'delete' | 'find',
    ) {
        // Si el error es una NotFoundException, simplemente lo relanzamos
        if (error instanceof NotFoundException) {
            throw error;
        }
        // Duplicados en campos únicos
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(`Error on ${errorType} tag`);
    }
}
