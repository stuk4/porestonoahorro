import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user-proifle.dto';

import { UserProfile } from './entities/user-profile.entity';

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
                userProfile: {
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
        userDetails: UpdateUserDto,
    ): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        // Define los campos que pertenecen a cada entidad
        const userFields = ['username', 'full_name', 'birth_date'];
        const profileFields = [
            'username',
            'gender',
            'website',
            'facebook_profile',
            'instagram_profile',
            'x_profile',
            'tiktok_profile',
            'location',
        ];

        try {
            const user = await queryRunner.manager.findOne(User, {
                where: { uuid: uuidUser },
                relations: ['userProfile'],
            });

            if (!user) {
                return null;
            }

            // Filtra y actualiza propiedades del usuario
            Object.assign(user, this.pick(userDetails, userFields));

            if (!user.userProfile) {
                user.userProfile = new UserProfile();
            }

            // Filtra y actualiza propiedades del perfil
            Object.assign(
                user.userProfile,
                this.pick(userDetails, profileFields),
            );

            // Si se proporcionan imágenes, actualiza las URLs de las imágenes del perfil
            if (userDetails.images && userDetails.images.length > 0) {
                user.userProfile.thumbnailUrl = userDetails.images[0];
                if (userDetails.images.length > 1) {
                    user.userProfile.pictureUrl = userDetails.images[1];
                }
            }

            await queryRunner.manager.save(UserProfile, user.userProfile);
            await queryRunner.manager.save(User, user);

            await queryRunner.commitTransaction();

            return user;
        } catch (error) {
            this.logger.error('Error updating user (repository)', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // Función para recoger propiedades específicas de un objeto
    private pick(obj, keys) {
        return keys.reduce((acc, key) => {
            if (obj[key] !== undefined) {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    }
}
