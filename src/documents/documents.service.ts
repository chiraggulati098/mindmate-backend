import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentModel, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
    private subjectsService: SubjectsService,
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
}
