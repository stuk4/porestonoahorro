import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interfaces';
import { ConfigService } from '@nestjs/config';
import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UserRepository } from '../../user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userRepository: UserRepository,

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
