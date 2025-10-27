import { IsString, IsEnum, IsOptional, IsMongoId, ValidateIf } from 'class-validator';
import { DocumentType } from '../schemas/document.schema';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @ValidateIf(o => o.type === DocumentType.TEXT)
  @IsString()
  content?: string; // Required for text notes, optional for PDFs

  @ValidateIf(o => o.type === DocumentType.PDF)
  @IsString()
  @IsOptional()
  fileUrl?: string; // For PDFs - commented out for now, will add Cloudflare R2 later

  @ValidateIf(o => o.type === DocumentType.PDF)
  @IsString()
  @IsOptional()
  fileName?: string;

  @ValidateIf(o => o.type === DocumentType.PDF)
  @IsOptional()
  fileSize?: number;

  @IsMongoId()
  subjectId: string;
}