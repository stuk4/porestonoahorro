import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
@Injectable()
export class AuthService {
    private readonly logger = new Logger();
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });
            await this.userRepository.save(user);
            const token = this.getJwtToken({ uuid: user.uuid });

            return {
                ...user,
                token,
            };
        } catch (error) {
            this.handleDBExceptions(error, 'create');
        }
    }

    async login(loginUserDto: LoginUserDto) {
        try {
            const { email, password } = loginUserDto;
            const user = await this.userRepository.findOne({
                where: { email },
                select: {
                    email: true,
                    username: true,
                    password: true,
                    uuid: true,
                },
            });
            if (!user)
                throw new UnauthorizedException('Credentials are not valid');

            if (!bcrypt.compareSync(password, user.password))
                throw new UnauthorizedException('Credentials are not valid');
            const token = this.getJwtToken({ uuid: user.uuid });

            return { ...user, token };
        } catch (error) {
            this.handleDBExceptions(error, 'login');
        }
    }

    private getJwtToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
    }

    private handleDBExceptions(
        error: any,
        errorType: 'create' | 'update' | 'delete' | 'find' | 'login',
    ): never {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        // Si el error es una NotFoundException, simplemente lo relanzamos
        if (error instanceof NotFoundException) {
            throw error;
        }
        // Duplicados en campos únicos
        if (error.code === '23505') throw new ConflictException(error.detail);
        this.logger.error(error);

        throw new InternalServerErrorException(`Error on ${errorType} user`);
    }
}
