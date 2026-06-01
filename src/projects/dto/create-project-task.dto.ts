import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

const trimString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

const optionalString = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : undefined;
};

const optionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return Number(value);
};

export class CreateProjectTaskDto {
  @ApiProperty({
    example: 'Сделать страницу профиля пользователя',
    description: 'Название задачи',
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }: { value: unknown }) => trimString(value))
  title!: string;

  @ApiPropertyOptional({
    example: 'Нужно сверстать публичную страницу профиля',
    description: 'Описание задачи',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  description?: string;

  @ApiPropertyOptional({
    enum: TaskType,
    example: TaskType.TASK,
    description: 'Тип задачи',
  })
  @IsOptional()
  @IsEnum(TaskType)
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  type?: TaskType;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Приоритет задачи',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 'c1f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description:
      'ID стадии workflow. Если не передан, задача создаётся в стартовой стадии проекта',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  workflowStageId?: string;

  @ApiPropertyOptional({
    example: 'd2f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID исполнителя',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  assigneeId?: string;

  @ApiPropertyOptional({
    example: 'e3f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID спринта',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  sprintId?: string;

  @ApiPropertyOptional({
    example: 'a4f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID родительской задачи',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  parentId?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Story points',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => optionalNumber(value))
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Дедлайн задачи',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: unknown }) => optionalString(value))
  dueDate?: string;
}
