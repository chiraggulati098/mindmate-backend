import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentModel, DocumentSchema } from './schemas/document.schema';
import { SubjectsModule } from '../subjects/subjects.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentModel.name, schema: DocumentSchema }]),
    SubjectsModule,
    AuthModule
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
