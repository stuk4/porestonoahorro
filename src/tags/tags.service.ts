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
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class TagsService {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,

        private readonly paginationService: PaginationService,
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
        return this.paginationService.paginate<Tag>(
            this.tagRepository,
            paginationDto,
            {
                where: { status: Status.PUBLISHED },
            },
        );
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
