import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SharpImagePipe } from './pipes/sharp-image.pipe';
import { Auth } from '../auth/decorators';
import { Role } from '../auth/interfaces/auth.interfaces';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('product')
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
        return this.filesService.uploadTempFiles(files, response);
    }
}
