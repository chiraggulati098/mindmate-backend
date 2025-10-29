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

  @IsString()
  @IsOptional()
  fileUrl?: string; // For PDFs - commented out for now, will add Cloudflare R2 later

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsOptional()
  fileSize?: number;

  @IsMongoId()
  subjectId: string;
}