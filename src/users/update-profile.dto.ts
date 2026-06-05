import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nikita',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MaxLength(50, { message: 'Имя должно быть не длиннее 50 символов' })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Pogorelov',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MaxLength(50, { message: 'Фамилия должна быть не длиннее 50 символов' })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Angular Developer',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Должность должна быть строкой' })
  @MaxLength(100, {
    message: 'Должность должна быть не длиннее 100 символов',
  })
  position?: string;

  @ApiPropertyOptional({
    example: 'Делаю AstushaApp и люблю кота Астюшу',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(1000, {
    message: 'Описание должно быть не длиннее 1000 символов',
  })
  about?: string;
}
