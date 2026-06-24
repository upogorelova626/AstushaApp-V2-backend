import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class TaskCommentParamDto {
  @ApiProperty({
    example: 'c1f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID проекта',
  })
  @IsUUID()
  projectId!: string;

  @ApiProperty({
    example: 'd2f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID задачи',
  })
  @IsUUID()
  taskId!: string;

  @ApiPropertyOptional({
    example: 'e3f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID комментария',
  })
  @IsOptional()
  @IsUUID()
  commentId?: string;
}
