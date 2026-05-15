import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
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
