import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UserDatabaseRepository } from './user-database.repository';

@Module({
    providers: [UserDatabaseRepository],
    imports: [TypeOrmModule.forFeature([User, Profile])],

    exports: [TypeOrmModule],
})
export class UserDatabaseModule {}
