import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddTeamMemberDto } from './add-team-member.dto';
import { UpdateTeamMemberDto } from './update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamMembers(currentUserId: string, teamId: string) {
    await this.checkIsTeamMember(currentUserId, teamId);

    return this.prisma.teamMember.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: this.teamMemberSelect(),
    });
  }

  async addTeamMember(
    currentUserId: string,
    teamId: string,
    dto: AddTeamMemberDto,
  ) {
    await this.checkCanManageTeamMembers(currentUserId, teamId);

    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingMember = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: dto.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingMember) {
      throw new ConflictException('Пользователь уже состоит в команде');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId: dto.userId,
        role: dto.role,
      },
      select: this.teamMemberSelect(),
    });
  }

  async updateTeamMember(
    currentUserId: string,
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
  ) {
    await this.checkCanManageTeamMembers(currentUserId, teamId);

    const member = await this.getTeamMemberByIdOrThrow(teamId, memberId);

    if (member.role === 'OWNER') {
      throw new BadRequestException('Нельзя изменить роль владельца команды');
    }

    return this.prisma.teamMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: dto.role,
      },
      select: this.teamMemberSelect(),
    });
  }

  async deleteTeamMember(
    currentUserId: string,
    teamId: string,
    memberId: string,
  ) {
    await this.checkCanManageTeamMembers(currentUserId, teamId);

    const member = await this.getTeamMemberByIdOrThrow(teamId, memberId);

    if (member.role === 'OWNER') {
      throw new BadRequestException('Нельзя удалить владельца команды');
    }

    await this.prisma.teamMember.delete({
      where: {
        id: memberId,
      },
    });

    return {
      success: true,
    };
  }

  private async checkIsTeamMember(userId: string, teamId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Команда не найдена');
    }
  }

  private async checkCanManageTeamMembers(userId: string, teamId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Команда не найдена');
    }

    if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Недостаточно прав для управления участниками команды',
      );
    }
  }

  private async getTeamMemberByIdOrThrow(teamId: string, memberId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Участник команды не найден');
    }

    return member;
  }

  private teamMemberSelect() {
    return {
      id: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          login: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          position: true,
        },
      },
    };
  }
}
