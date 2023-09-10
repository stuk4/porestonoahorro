import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('product')
    @UseInterceptors(FileInterceptor('file'))
    uploadProductImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return file;
    }
}
