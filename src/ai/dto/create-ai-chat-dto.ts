import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiChatDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;
}
