import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user-proifle.dto';

import { Profile } from './entities/profile.entity';

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
                relations: ['profile'],
            });

            if (!user) {
                return null;
            }

            // Filtra y actualiza propiedades del usuario
            Object.assign(user, this.pick(userDetails, userFields));

            if (!user.profile) {
                user.profile = new Profile();
            }

            // Filtra y actualiza propiedades del perfil
            Object.assign(user.profile, this.pick(userDetails, profileFields));

            // Si se proporcionan imágenes, actualiza las URLs de las imágenes del perfil
            if (userDetails.images && userDetails.images.length > 0) {
                user.profile.thumbnail_url = userDetails.images[0];
                if (userDetails.images.length > 1) {
                    user.profile.picture_url = userDetails.images[1];
                }
            }

            await queryRunner.manager.save(Profile, user.profile);
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

    // async updateUserWithProfile(
    //     uuidUser: string,
    //     userDetails: UpdateUserDto,
    // ): Promise<User> {
    //     const queryRunner = this.dataSource.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     try {
    //         const user = await queryRunner.manager.findOne(User, {
    //             where: { uuid: uuidUser },
    //             relations: ['profile'],
    //         });

    //         if (!user) {
    //             return null;
    //         }

    //         // Construcción de datos para el perfil
    //         const profileData = {
    //             username: userDetails.username,
    //             gender: userDetails.gender,
    //             website: userDetails.website,
    //             facebook_profile: userDetails.facebook_profile,
    //             instagram_profile: userDetails.instagram_profile,
    //             x_profile: userDetails.x_profile,
    //             tiktok_profile: userDetails.tiktok_profile,
    //             location: userDetails.location,
    //             picture_url: userDetails.images
    //                 ? userDetails.images[1]
    //                 : undefined,
    //             thumbnail_url: userDetails.images
    //                 ? userDetails.images[0]
    //                 : undefined,
    //         };

    //         // Lista de campos que pertenecen a User y no a Profile
    //         const userFields = [
    //             'email',
    //             'full_name',
    //             'birth_date',
    //             'ip_address',
    //             'is_active',
    //             'roles',
    //             'created_at',
    //             'updated_at',
    //         ];

    //         // Actualiza campos del usuario si han cambiado
    //         for (const field of userFields) {
    //             if (
    //                 userDetails[field] !== undefined &&
    //                 user[field] !== userDetails[field]
    //             ) {
    //                 user[field] = userDetails[field];
    //             }
    //         }

    //         // Actualiza campos del perfil si han cambiado
    //         if (!user.profile) {
    //             user.profile = new Profile();
    //         }
    //         for (const field in profileData) {
    //             if (
    //                 profileData[field] !== undefined &&
    //                 user.profile[field] !== profileData[field]
    //             ) {
    //                 user.profile[field] = profileData[field];
    //             }
    //         }

    //         await queryRunner.manager.save(Profile, user.profile); // Primero guarda el perfil
    //         await queryRunner.manager.save(User, user); // Luego guarda el usuario

    //         await queryRunner.commitTransaction();

    //         return user;
    //     } catch (error) {
    //         this.logger.error('Error updating user (repository)', error);
    //         await queryRunner.rollbackTransaction();
    //         throw error;
    //     } finally {
    //         await queryRunner.release();
    //     }
    // }
}
