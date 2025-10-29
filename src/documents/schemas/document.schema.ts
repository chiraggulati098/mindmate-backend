import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

export enum DocumentType {
  TEXT = 'text',
  PDF = 'pdf',
}

export enum ProcessingStatus {
  NOT_PROCESSED = 'NOT_PROCESSED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class DocumentModel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: DocumentType })
  type: DocumentType;

  @Prop()
  content?: string; // For text notes

  @Prop()
  fileUrl?: string; // For PDFs - Cloudflare R2 public URL

  @Prop()
  fileKey?: string; // S3/R2 object key for file operations

  @Prop()
  fileName?: string; // Original filename for PDFs

  @Prop()
  fileSize?: number; // File size in bytes

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  // Processing status fields
  @Prop({ enum: ProcessingStatus, default: ProcessingStatus.NOT_PROCESSED })
  summary_status: ProcessingStatus;

  @Prop({ enum: ProcessingStatus, default: ProcessingStatus.NOT_PROCESSED })
  flashcard_status: ProcessingStatus;

  @Prop({ enum: ProcessingStatus, default: ProcessingStatus.NOT_PROCESSED })
  mcq_status: ProcessingStatus;

  // Content fields
  @Prop({ default: '' })
  summary: string;

  @Prop({ default: '' })
  flashcards: string;

  @Prop({ default: '' })
  mcqs: string;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

// Add indexes for better query performance
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ subjectId: 1 });
DocumentSchema.index({ userId: 1, subjectId: 1 }); 