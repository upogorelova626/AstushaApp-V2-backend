import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        position: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createUser(data: { login: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        position: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
