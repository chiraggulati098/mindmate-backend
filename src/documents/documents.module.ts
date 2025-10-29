import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentModel, DocumentSchema } from './schemas/document.schema';
import { SubjectsModule } from '../subjects/subjects.module';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentModel.name, schema: DocumentSchema }]),
    SubjectsModule,
    AuthModule,
    S3Module
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
