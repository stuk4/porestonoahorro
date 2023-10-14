import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDatabaseRepository } from './user-database.repository';

// import { UpdateProfileDto } from './dto/update-user-proifle.dto';

@Injectable()
export class UserDatabaseService {
    private readonly logger = new Logger();
    constructor(private readonly userRepository: UserDatabaseRepository) {}
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
