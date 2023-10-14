import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UserDatabaseRepository } from './user-database.repository';
import { UserDatabaseService } from './user-database.service';

@Module({
    providers: [UserDatabaseService, UserDatabaseRepository],
    imports: [TypeOrmModule.forFeature([User, Profile])],

    exports: [TypeOrmModule, UserDatabaseService, UserDatabaseRepository],
})
export class UserDatabaseModule {}
