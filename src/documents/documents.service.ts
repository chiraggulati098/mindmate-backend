import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentModel, DocumentDocument, DocumentType } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { SubjectsService } from '../subjects/subjects.service';
import { S3Service } from '../s3/s3.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
    private subjectsService: SubjectsService,
    private s3Service: S3Service,
    private redisService: RedisService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string): Promise<DocumentModel> {
    // Verify user owns the subject
    await this.subjectsService.findOne(createDocumentDto.subjectId, userId);

    const createdDocument = new this.documentModel({
      ...createDocumentDto,
      userId: new Types.ObjectId(userId),
      subjectId: new Types.ObjectId(createDocumentDto.subjectId),
    });
    
    return createdDocument.save();
  }

  async findOne(id: string, userId: string): Promise<DocumentModel> {
    const document = await this.documentModel
      .findOne({ _id: id })
      .populate('subjectId')
      .exec();
    
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user owns this document
    if (document.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<DocumentModel> {
    await this.findOne(id, userId);
    
    const updatedDocument = await this.documentModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateDocumentDto,
        { new: true }
      )
      .exec();
    
    if (!updatedDocument) {
      throw new NotFoundException('Document not found');
    }
    
    return updatedDocument;
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);
    
    if (document.type === DocumentType.PDF && document.fileKey) {
      try {
        await this.s3Service.deleteFile(document.fileKey);
      } catch (error) {
        // log error but proceed with deletion
        console.error('Failed to delete file from R2:', error);
      }
    }

    const result = await this.documentModel.deleteOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Document not found');
    }
  }

  // Helper method to find documents by subject (for future use)
  async findBySubject(subjectId: string, userId: string): Promise<DocumentModel[]> {
    // Verify user owns the subject
    await this.subjectsService.findOne(subjectId, userId);

    return this.documentModel.find({ 
      subjectId: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId)
    }).exec();
  }

  async attachPdf(documentId: string, file: Express.Multer.File, userId: string): Promise<DocumentModel> {
    // First verify the document exists and belongs to the user
    const document = await this.findOne(documentId, userId);

    // Check if document already has a PDF attached
    if (document.type === DocumentType.PDF && document.fileKey) {
      // Delete the old PDF from R2
      try {
        await this.s3Service.deleteFile(document.fileKey);
      } catch (error) {
        console.error('Failed to delete old PDF:', error);
      }
    }

    // Upload new file to R2
    const { key, url } = await this.s3Service.uploadFile(file, userId);

    // Update the document with PDF info
    const updatedDocument = await this.documentModel
      .findOneAndUpdate(
        { _id: documentId, userId: new Types.ObjectId(userId) },
        {
          type: DocumentType.PDF,
          fileUrl: url,
          fileKey: key,
          fileName: file.originalname,
          fileSize: file.size,
        },
        { new: true }
      )
      .populate('subjectId')
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException('Document not found');
    }
    
    return updatedDocument;
  }

  async processDocument(documentId: string, userId: string): Promise<DocumentModel> {
    const document = await this.findOne(documentId, userId);

    // use enqueue method from RedisService to send processing request
    await this.redisService.enqueue('process-pdf', {
      documentId,
      userId,
    });
    console.log(`Sent processing request to Redis Queue for document: ${documentId}; user ID: ${userId}`);

    return document;
  }
}
