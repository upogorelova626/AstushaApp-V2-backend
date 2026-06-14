import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../auth/constants/auth-cookie.const';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import type { StorageUploadFile } from '../storage/storage.service';
import { ChangePasswordDto } from './change-password.dto';
import { LookupUserDto } from './lookup-user.dto';
import { UpdateProfileDto } from './update-profile.dto';
import { UpdateUserThemeDto } from './update-user-theme.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Получить свой профиль' })
  @Get('profile')
  getProfile(@Req() request: AuthRequest) {
    return this.usersService.findById(request.user.id);
  }

  @ApiOperation({ summary: 'Найти пользователя по email или login' })
  @Get('lookup')
  lookupUser(@Req() request: AuthRequest, @Query() query: LookupUserDto) {
    return this.usersService.lookupUser(request.user.id, query.identifier);
  }

  @ApiOperation({ summary: 'Обновить свой профиль' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          example: 'Nikita',
        },
        lastName: {
          type: 'string',
          example: 'Pogorelov',
        },
        position: {
          type: 'string',
          example: 'Angular Developer',
        },
        about: {
          type: 'string',
          example: 'Делаю AstushaApp и люблю кота Астюшу',
        },
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @Patch('profile')
  updateProfile(
    @Req() request: AuthRequest,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: StorageUploadFile,
  ) {
    return this.usersService.updateProfile(request.user.id, dto, avatar);
  }

  @ApiOperation({ summary: 'Удалить аватар профиля' })
  @Delete('profile/avatar')
  deleteAvatar(@Req() request: AuthRequest) {
    return this.usersService.deleteAvatar(request.user.id);
  }

  @ApiOperation({ summary: 'Изменить пароль' })
  @Patch('profile/password')
  changePassword(@Req() request: AuthRequest, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(request.user.id, dto);
  }

  @ApiOperation({ summary: 'Сменить тему аккаунта' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          enum: ['LIGHT', 'DARK'],
          example: 'DARK',
        },
      },
      required: ['theme'],
    },
  })
  @Patch('profile/theme')
  updateTheme(@Req() request: AuthRequest, @Body() dto: UpdateUserThemeDto) {
    return this.usersService.updateMyTheme(request.user.id, dto.theme);
  }

  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @Delete('profile')
  async deleteProfile(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.usersService.deleteProfile(request.user.id);

    this.clearAuthCookies(response);

    return result;
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }
}
