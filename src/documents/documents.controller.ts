import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentsService.create(createDocumentDto, req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Request() req) {
    return this.documentsService.update(id, updateDocumentDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(id, req.user.sub);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string, @Request() req) {
    return this.documentsService.findBySubject(subjectId, req.user.sub);
  }

  @Post(':id/attach-pdf')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF files are allowed'), false);
      }
    },
  }))
  async attachPdf(
    @Param('id') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.documentsService.attachPdf(documentId, file, req.user.sub);
  }
}
