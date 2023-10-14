import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserDatabaseRepository } from '../user-database/user-database.repository';

import { FilesModule } from '../files/files.module';
import { AuthModule } from '../auth/auth.module';
import { UserDatabaseModule } from '../user-database/user-database.module';
import { UserService } from './user.services';

@Module({
    controllers: [UserController],
    providers: [UserService, UserDatabaseRepository],
    imports: [FilesModule, UserDatabaseModule, AuthModule],
    exports: [],
})
export class UserModule {}
