import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({
    example: 'Frontend Team',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Название команды должно быть строкой' })
  @MaxLength(100, {
    message: 'Название команды должно быть не длиннее 100 символов',
  })
  name?: string;

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

  @ApiPropertyOptional({
    example: 'https://example.com/team-avatar.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ссылка на картинку команды должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на картинку команды должна быть не длиннее 500 символов',
  })
  avatarUrl?: string;
}
