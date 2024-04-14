import {
  Controller,
  Post,
  PreconditionFailedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('whitelist-excel')
  @ApiOperation({ summary: 'Upload excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'formData',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    const externalFileValid = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!externalFileValid.includes(file.mimetype)) {
      throw new PreconditionFailedException(
        'The file format is invalid',
        'INVALID_FILE_TYPE',
      );
    }

    return this.appService.generateImagesFromFile(file);
  }
}
