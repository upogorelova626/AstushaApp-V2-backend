import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../../users/users.service';
import { ACCESS_TOKEN_COOKIE_NAME } from '../constants/auth-cookie.const';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { AuthRequest } from '../types/auth-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const cookies = request.cookies as Record<string, string | undefined>;
    const accessToken = cookies[ACCESS_TOKEN_COOKIE_NAME];

    if (!accessToken) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const jwtAccessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: jwtAccessSecret,
      });
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }

    const localUser = await this.usersService.findOrCreateByAstushaIdUser({
      id: payload.sub,
      email: payload.email,
    });

    request.user = {
      id: localUser.id,
      email: payload.email,
    };

    return true;
  }
}
