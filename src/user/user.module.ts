import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepository],
    imports: [TypeOrmModule.forFeature([User, Profile])],
    exports: [TypeOrmModule, UserService],
})
export class UserModule {}
