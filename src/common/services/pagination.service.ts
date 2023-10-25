import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginationDto } from '../dtos/pagination.dto';

@Injectable()
export class PaginationService {
    async paginate<T>(
        repository: Repository<T>,
        paginationDto: PaginationDto,
        options: FindManyOptions<T> = {},
    ): Promise<{ data: T[]; meta: any }> {
        const { perPage = 10, page = 1 } = paginationDto;

        const [data, total] = await repository.findAndCount({
            ...options,
            take: perPage,
            skip: (page - 1) * perPage,
        });

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / perPage),
                has_prev_page: page > 1,
                has_next_page: page < Math.ceil(total / perPage),
            },
        };
    }
}
