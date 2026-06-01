import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProjectWorkflowStageDto {
  @ApiProperty({
    example: 'To Do',
    description: 'Название стадии workflow',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;
}
