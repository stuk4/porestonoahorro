import { DataSource, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WishlistRepository extends Repository<Wishlist> {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(Wishlist)
        private readonly userRepository: Repository<Wishlist>,
        private readonly dataSource: DataSource,
    ) {
        super(
            userRepository.target,
            userRepository.manager,
            userRepository.queryRunner,
        );
    }
}
