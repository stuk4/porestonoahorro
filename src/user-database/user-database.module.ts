import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserDatabaseRepository } from './user-database.repository';

@Module({
    providers: [UserDatabaseRepository],
    imports: [TypeOrmModule.forFeature([User, UserProfile])],

    exports: [TypeOrmModule],
})
export class UserDatabaseModule {}
