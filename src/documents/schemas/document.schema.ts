import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

export enum DocumentType {
  TEXT = 'text',
  PDF = 'pdf',
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
  fileUrl?: string; // For PDFs - will store Cloudflare R2 URL later

  @Prop()
  fileName?: string; // Original filename for PDFs

  @Prop()
  fileSize?: number; // File size in bytes

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

// Add indexes for better query performance
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ subjectId: 1 });
DocumentSchema.index({ userId: 1, subjectId: 1 }); 