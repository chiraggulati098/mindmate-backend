import { IsString, IsOptional } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string; // For text notes only

  @IsString()
  @IsOptional()
  fileName?: string;
}