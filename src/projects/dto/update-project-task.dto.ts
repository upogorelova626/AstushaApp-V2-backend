import { ApiPropertyOptional } from '@nestjs/swagger';
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

const optionalTrimString = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === 'string' ? value.trim() : value;
};

const optionalString = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : undefined;
};

const nullableString = (value: unknown) => {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : null;
};

const nullableNumber = (value: unknown) => {
  if (value === null || value === '') {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  return Number(value);
};

export class UpdateProjectTaskDto {
  @ApiPropertyOptional({
    example: 'Сделать страницу профиля пользователя',
    description: 'Название задачи',
  })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  @Transform(({ value }: { value: unknown }) => optionalTrimString(value))
  title?: string;

  @ApiPropertyOptional({
    example: 'Нужно сверстать публичную страницу профиля',
    description: 'Описание задачи',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(({ value }: { value: unknown }) => nullableString(value))
  description?: string | null;

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
    example: 'd2f7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID исполнителя',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => nullableString(value))
  assigneeId?: string | null;

  @ApiPropertyOptional({
    example: 5,
    description: 'Story points',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => nullableNumber(value))
  @IsInt()
  @Min(0)
  storyPoints?: number | null;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Дедлайн задачи',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: unknown }) => nullableString(value))
  dueDate?: string | null;
}
