import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import {
  ProjectPriority,
  ProjectWorkflowType,
} from 'src/generated/prisma/enums';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Astusha App',
    description: 'Название проекта',
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiProperty({
    example: 'AST',
    description: 'Короткий ключ проекта. Например: AST, CRM, BOOKME',
  })
  @IsString()
  @Length(2, 10)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message:
      'key must contain only uppercase latin letters, numbers and underscore, and start with a letter',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  key!: string;

  @ApiPropertyOptional({
    example: 'Приложение для управления проектами',
    description: 'Описание проекта',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({
    enum: ProjectWorkflowType,
    example: ProjectWorkflowType.SIMPLE,
    description: 'Тип рабочего процесса проекта',
  })
  @IsOptional()
  @IsEnum(ProjectWorkflowType)
  workflowType?: ProjectWorkflowType;

  @ApiPropertyOptional({
    enum: ProjectPriority,
    example: ProjectPriority.MEDIUM,
    description: 'Приоритет проекта',
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({
    example: '2026-05-24',
    description: 'Дата начала проекта',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-24',
    description: 'Дедлайн проекта',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
