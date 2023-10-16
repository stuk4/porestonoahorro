import {
    Controller,
    Get,
    Param,
    Delete,
    Post,
    UseInterceptors,
    UploadedFiles,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
    Res,
    Patch,
    Body,
} from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SharpImagePipe } from '../files/pipes/sharp-image.pipe';
import { Response } from 'express';
import { UserService } from './user.service';

import { User } from '../user-database/entities/user.entity';
import { UpdateUserDto } from '../user-database/dto/update-user-proifle.dto';
// import { UpdateProfileDto } from '../user-database/dto/update-user-proifle.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('file')
    @Auth(Role.USER)
    @UseInterceptors(FilesInterceptor('files', 3))
    uploadTempProductImage(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
            SharpImagePipe,
        )
        files: Array<Express.Multer.File>,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.userService.uploadTempUserImage(files, response);
    }

    @Patch()
    @Auth(Role.USER)
    updateCurrentUser(
        @Body() updateUserDto: UpdateUserDto,
        @GetUser() user: User,
    ) {
        return this.userService.update(user.uuid, updateUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    // @Patch(':uuid')
    // update(
    //     @Param('uuid') uuid: string,
    //     @Body() updateProfileDto: UpdateProfileDto,
    // ) {
    //     return this.userDatabaseService.updateWithProfile(uuid, updateProfileDto);
    // }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
