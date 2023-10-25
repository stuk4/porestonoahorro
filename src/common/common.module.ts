import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { PaginationService } from './services/pagination.service';

@Module({
    providers: [CommonService, PaginationService],
})
export class CommonModule {}
