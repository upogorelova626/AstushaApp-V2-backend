import { IsEnum } from 'class-validator';
import { UserTheme } from 'src/generated/prisma/client';

export class UpdateUserThemeDto {
  @IsEnum(UserTheme)
  theme!: UserTheme;
}
