import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto';
import { UpdateProfileDto } from './dto/update-user-proifle.dto';

@Injectable()
export class UserDatabaseRepository extends Repository<User> {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
    ) {
        super(
            userRepository.target,
            userRepository.manager,
            userRepository.queryRunner,
        );
    }

    async createUserWithProfile(userDetails: CreateUserDto): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = queryRunner.manager.create(User, {
                ...userDetails,
                profile: {
                    username: userDetails.username,
                },
            });
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();

            return user;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateUserWithProfile(
        uuidUser: string,
        userDetails: UpdateProfileDto,
    ): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = queryRunner.manager.create(User, {
                ...userDetails,
                profile: {
                    username: userDetails.username,
                },
            });
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();

            return user;
        } catch (error) {
            this.logger.error('Error updating product', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
