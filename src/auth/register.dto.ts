import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'nikita',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  @MinLength(3, { message: 'Логин должен быть не короче 3 символов' })
  @MaxLength(30, { message: 'Логин должен быть не длиннее 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Логин может содержать только латинские буквы, цифры и подчёркивание',
  })
  login!: string;

  @ApiProperty({
    example: 'nikita@mail.com',
    maxLength: 255,
  })
  @IsString({ message: 'Email должен быть строкой' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(255, { message: 'Email должен быть не длиннее 255 символов' })
  email!: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    maxLength: 72,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  @MaxLength(72, { message: 'Пароль должен быть не длиннее 72 символов' })
  password!: string;
}
