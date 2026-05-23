import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

import { TaskPriority, TaskType } from 'src/generated/prisma/enums';

export class CreateProjectTaskDto {
  @ApiProperty({
    example: 'Сделать страницу профиля пользователя',
    description: 'Название задачи',
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiPropertyOptional({
    example: 'Нужно сверстать публичную страницу профиля',
    description: 'Описание задачи',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({
    enum: TaskType,
    example: TaskType.TASK,
    description: 'Тип задачи',
  })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Приоритет задачи',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    example: 'c1f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID стадии workflow',
  })
  @IsUUID()
  workflowStageId!: string;

  @ApiPropertyOptional({
    example: 'd2f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID исполнителя',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    example: 'e3f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID спринта',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({
    example: 'a4f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID родительской задачи',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Story points',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Дедлайн задачи',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
