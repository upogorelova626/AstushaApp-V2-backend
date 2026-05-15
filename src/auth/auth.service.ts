import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from './constants/auth-cookie.const';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import type { CookieRequest } from './types/cookie-request.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, response: Response) {
    const existingUserByEmail = await this.usersService.findByEmail(dto.email);

    if (existingUserByEmail) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const existingUserByLogin = await this.usersService.findByLogin(dto.login);

    if (existingUserByLogin) {
      throw new BadRequestException(
        'Пользователь с таким login уже существует',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.setAuthCookies(response, user.id, user.email);

    return {
      user,
    };
  }

  async login(dto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    await this.setAuthCookies(response, user.id, user.email);

    return {
      user: this.buildUserResponse(user),
    };
  }

  async refresh(request: CookieRequest, response: Response) {
    const refreshToken = this.getCookie(request, REFRESH_TOKEN_COOKIE_NAME);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token отсутствует');
    }

    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token истёк');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await this.setAuthCookies(
      response,
      storedToken.user.id,
      storedToken.user.email,
    );

    return {
      user: this.buildUserResponse(storedToken.user),
    };
  }

  async logout(request: CookieRequest, response: Response) {
    const refreshToken = this.getCookie(request, REFRESH_TOKEN_COOKIE_NAME);

    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: {
          tokenHash,
        },
      });

      if (storedToken && !storedToken.revokedAt) {
        await this.prisma.refreshToken.update({
          where: {
            id: storedToken.id,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    }

    this.clearAuthCookies(response);

    return {
      success: true,
    };
  }

  me(userId: string) {
    return this.usersService.findById(userId);
  }

  private getCookie(
    request: CookieRequest,
    cookieName: string,
  ): string | undefined {
    return request.cookies[cookieName];
  }

  private async setAuthCookies(
    response: Response,
    userId: string,
    email: string,
  ) {
    const accessToken = this.signAccessToken(userId, email);
    const refreshToken = await this.createRefreshToken(userId);

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: this.getAccessTokenExpiresInMs(),
    });

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: this.getRefreshTokenExpiresInMs(),
    });
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

  private signAccessToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  private async createRefreshToken(userId: string) {
    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + this.getRefreshTokenExpiresInMs()),
      },
    });

    return refreshToken;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getAccessTokenExpiresInMs() {
    return 60 * 60 * 1000;
  }

  private getRefreshTokenExpiresInMs() {
    const refreshTokenExpiresInDays = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN_DAYS') ?? 7,
    );

    return refreshTokenExpiresInDays * 24 * 60 * 60 * 1000;
  }

  private buildUserResponse(user: {
    id: string;
    login: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    position: string | null;
    about: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      position: user.position,
      about: user.about,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
