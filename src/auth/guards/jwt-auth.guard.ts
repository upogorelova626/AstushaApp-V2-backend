import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ACCESS_TOKEN_COOKIE_NAME } from '../constants/auth-cookie.const';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { AuthRequest } from '../types/auth-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const accessToken = request.cookies[ACCESS_TOKEN_COOKIE_NAME];

    if (!accessToken) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
