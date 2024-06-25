import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  Get,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE } from 'src/config/const';
import { ExcavationService } from './excavation.service';

import { PaginationParams } from 'src/config/common';
import { CurrentUser, User } from 'src/decorators/user.decorator';
import * as multer from 'multer';
import { Pagination } from 'src/decorators/pagination.decorator';

@Controller('excavation')
export class ExcavationController {
  constructor(private readonly excavationService: ExcavationService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('excel', {
      // storage: diskStorage({
      //   destination: './uploads', // Directory where files will be saved
      //   filename: (req, file, callback) => {
      //     // Generating a unique file name
      //     const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      //     callback(null, `${uniqueName}_${file.originalname}`);
      //   },
      // }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx|xls|xlsm)$/)) {
          return callback(
            new BadRequestException('Only Excel files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: multer.Express.Multer.File,
    @User() currentUser: CurrentUser,
  ) {
    return this.excavationService.uploadExcelFile(file, currentUser);
  }

  @Get()
  async getAll(@Pagination() pagination: PaginationParams) {
    return await this.excavationService.getAll(pagination);
  }

  @Put(':id')
  async retrySendingToTax(@Param('id', ParseIntPipe) id: number) {
    return await this.excavationService.retrySendToTaxSystem(id);
  }
}
