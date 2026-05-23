import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveProjectTaskDto {
  @ApiProperty({
    example: 'c1f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID новой стадии workflow',
  })
  @IsUUID()
  workflowStageId!: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Новая позиция задачи внутри колонки',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}
