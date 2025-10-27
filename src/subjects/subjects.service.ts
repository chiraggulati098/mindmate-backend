import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto, userId: string): Promise<Subject> {
    const createdSubject = new this.subjectModel({
      ...createSubjectDto,
      userId: new Types.ObjectId(userId),
    });
    return createdSubject.save();
  }

  async findAllByUser(userId: string): Promise<Subject[]> {
    return this.subjectModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findOne(id: string, userId: string): Promise<Subject> {
    const subject = await this.subjectModel.findOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    
    return subject;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.subjectModel.deleteOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Subject not found');
    }
  }
}
