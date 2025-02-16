import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UserDatabaseRepository } from '../user-database/user-database.repository';
import { UserDatabaseModule } from '../user-database/user-database.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserDatabaseRepository],
    imports: [
        ConfigModule,
        UserDatabaseModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN'),
                    },
                };
            },
        }),
    ],
    exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
