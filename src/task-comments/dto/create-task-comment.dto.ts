import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

const trimString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTaskCommentDto {
  @ApiProperty({
    example: 'Нужно проверить адаптив на странице задачи',
    description: 'Текст комментария',
  })
  @IsString()
  @Length(1, 2000)
  @Transform(({ value }: { value: unknown }) => trimString(value))
  text!: string;
}
