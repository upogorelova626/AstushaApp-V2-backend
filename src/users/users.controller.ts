import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../auth/constants/auth-cookie.const';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { ChangePasswordDto } from './change-password.dto';
import { UpdateProfileDto } from './update-profile.dto';
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

  @ApiOperation({ summary: 'Обновить свой профиль' })
  @Patch('profile')
  updateProfile(@Req() request: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(request.user.id, dto);
  }

  @ApiOperation({ summary: 'Изменить пароль' })
  @Patch('profile/password')
  changePassword(@Req() request: AuthRequest, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(request.user.id, dto);
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
