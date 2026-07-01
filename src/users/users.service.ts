import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './change-password.dto';
import { UpdateProfileDto } from './update-profile.dto';
import { StorageService, StorageUploadFile } from '../storage/storage.service';
import { UserTheme } from 'src/generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private readonly profileSelect = {
    id: true,
    login: true,
    email: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    position: true,
    about: true,
    theme: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: {
        login,
      },
    });
  }

  async lookupUser(currentUserId: string, identifier: string) {
    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier) {
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        id: {
          not: currentUserId,
        },
        OR: [
          {
            email: {
              equals: normalizedIdentifier,
              mode: 'insensitive',
            },
          },
          {
            login: {
              equals: normalizedIdentifier,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        position: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: this.profileSelect,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  createUser(data: { login: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({
      data,
      select: this.profileSelect,
    });
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatar?: StorageUploadFile,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        avatarKey: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const data: {
      firstName?: string | null;
      lastName?: string | null;
      position?: string | null;
      about?: string | null;
      avatarUrl?: string | null;
      avatarKey?: string | null;
    } = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName.trim() || null;
    }

    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName.trim() || null;
    }

    if (dto.position !== undefined) {
      data.position = dto.position.trim() || null;
    }

    if (dto.about !== undefined) {
      data.about = dto.about.trim() || null;
    }

    if (avatar) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedMimeTypes.includes(avatar.mimetype)) {
        throw new BadRequestException('Можно загрузить только изображение');
      }

      if (user.avatarKey) {
        await this.storageService.deleteFile(user.avatarKey);
      }

      const uploadedAvatar = await this.storageService.uploadFile(
        avatar,
        `users/${userId}/avatar`,
      );

      data.avatarUrl = uploadedAvatar.url;
      data.avatarKey = uploadedAvatar.key;
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: this.profileSelect,
    });
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        avatarKey: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.avatarKey) {
      await this.storageService.deleteFile(user.avatarKey);
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
      select: this.profileSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Текущий пароль указан неверно');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash,
      },
    });

    return {
      success: true,
    };
  }

  async deleteProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        avatarKey: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.avatarKey) {
      await this.storageService.deleteFile(user.avatarKey);
    }

    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      success: true,
    };
  }

  async updateMyTheme(userId: string, theme: UserTheme) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        theme,
      },
      select: this.profileSelect,
    });
  }

  async findOrCreateByAstushaIdUser(data: {
    astushaIdUserId: string;
    email: string;
  }) {
    const linkedUser = await this.prisma.user.findUnique({
      where: {
        astushaIdUserId: data.astushaIdUserId,
      },
    });

    if (linkedUser) {
      return linkedUser;
    }

    const userByEmail = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userByEmail) {
      return this.prisma.user.update({
        where: {
          id: userByEmail.id,
        },
        data: {
          astushaIdUserId: data.astushaIdUserId,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        astushaIdUserId: data.astushaIdUserId,
        email: data.email,
        login: `astusha_${data.astushaIdUserId}`,
        passwordHash: 'managed-by-astusha-id',
      },
    });
  }
}
