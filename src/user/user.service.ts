import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { FilesService } from '../files/files.service';
import { Response } from 'express';
import { UserDatabaseRepository } from '../user-database/user-database.repository';
import { CreateUserDto } from '../user-database/dto';
// import { UpdateProfileDto } from '../user-database/dto/update-user-proifle.dto';

@Injectable()
export class UserService {
    private readonly logger = new Logger();
    constructor(
        private readonly userRepository: UserDatabaseRepository,
        private readonly filesService: FilesService,
    ) {}
    async create(createUserDto: CreateUserDto) {
        try {
            const user =
                await this.userRepository.createUserWithProfile(createUserDto);

            return user;
        } catch (error) {
            this.handleDBExceptions(error, 'create');
        }
    }

    findAll() {
        return `This action returns all user`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    // updateWithProfile(uuid: string, updateProfileDto: UpdateProfileDto) {
    //     return `This action updates a #${uuid} user`;
    // }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async uploadTempUserImage(
        files: Array<Express.Multer.File>,
        response: Response,
    ) {
        return this.filesService.uploadTempFiles(files, response, 'product');
    }
    private handleDBExceptions(
        error: any,
        errorType: 'create' | 'update' | 'delete' | 'find' | 'login',
    ): never {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        // Si el error es una NotFoundException, simplemente lo relanzamos para menejarlo en de manera mas controlada
        if (error instanceof NotFoundException) {
            throw error;
        }
        // Duplicados en campos únicos
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(`Error on ${errorType} user`);
    }
}
