import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: '123456',
    minLength: 6,
    maxLength: 72,
  })
  @IsString({ message: 'Текущий пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Текущий пароль обязателен' })
  @MinLength(6, {
    message: 'Текущий пароль должен быть не короче 6 символов',
  })
  @MaxLength(72, {
    message: 'Текущий пароль должен быть не длиннее 72 символов',
  })
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword123',
    minLength: 6,
    maxLength: 72,
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(6, {
    message: 'Новый пароль должен быть не короче 6 символов',
  })
  @MaxLength(72, {
    message: 'Новый пароль должен быть не длиннее 72 символов',
  })
  newPassword!: string;
}
