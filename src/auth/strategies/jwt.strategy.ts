import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';
import { ConfigService } from '@nestjs/config';
import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { uuid } = payload;
        const user = await this.userRepository.findOneBy({ uuid });
        if (!user) throw new UnauthorizedException('Token not valid');

        if (!user.is_active)
            throw new ForbiddenException('User is inactive, contact an admin');

        return user;
    }
}
