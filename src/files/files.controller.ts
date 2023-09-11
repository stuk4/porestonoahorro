import {
    Body,
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

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('product')
    @UseInterceptors(FilesInterceptor('files', 3))
    uploadTempProductImage(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
                ],
            }),
        )
        files: Array<Express.Multer.File>,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.filesService.uploadTempFiles(files, response);
    }

    @Post('product-multiple')
    moveProductImage(@Body() tempKeys: string[]) {
        return this.filesService.moveToPermanentLocations(tempKeys);
    }
}
