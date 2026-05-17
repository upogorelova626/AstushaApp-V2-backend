import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    example: 'Frontend Team',
    maxLength: 100,
  })
  @IsString({ message: 'Название команды должно быть строкой' })
  @IsNotEmpty({ message: 'Название команды обязательно' })
  @MaxLength(100, {
    message: 'Название команды должно быть не длиннее 100 символов',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Команда frontend-разработчиков AstushaApp',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Описание команды должно быть строкой' })
  @MaxLength(500, {
    message: 'Описание команды должно быть не длиннее 500 символов',
  })
  description?: string;
}
