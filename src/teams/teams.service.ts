import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './create-team.dto';
import { UpdateTeamDto } from './update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(userId: string, dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      select: this.teamSelect(userId),
    });
  }

  async getMyTeams(userId: string) {
    const teams = await this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      select: this.teamSelect(userId),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teams.map((team) => this.mapTeamResponse(team));
  }

  async getTeamById(userId: string, teamId: string) {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
      select: this.teamSelect(userId),
    });

    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    return this.mapTeamResponse(team);
  }

  async updateTeam(userId: string, teamId: string, dto: UpdateTeamDto) {
    await this.checkCanManageTeam(userId, teamId);

    const team = await this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        avatarUrl: dto.avatarUrl,
      },
      select: this.teamSelect(userId),
    });

    return this.mapTeamResponse(team);
  }

  async deleteTeam(userId: string, teamId: string) {
    await this.checkCanDeleteTeam(userId, teamId);

    await this.prisma.team.delete({
      where: {
        id: teamId,
      },
    });

    return {
      success: true,
    };
  }

  private async checkCanManageTeam(userId: string, teamId: string) {
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
      throw new ForbiddenException('Недостаточно прав для изменения команды');
    }
  }

  private async checkCanDeleteTeam(userId: string, teamId: string) {
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

    if (member.role !== 'OWNER') {
      throw new ForbiddenException('Удалить команду может только владелец');
    }
  }

  private teamSelect(userId: string) {
    return {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      creatorId: true,
      createdAt: true,
      updatedAt: true,
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    };
  }

  private mapTeamResponse(team: {
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    members: {
      role: 'OWNER' | 'ADMIN' | 'MEMBER';
    }[];
    _count: {
      members: number;
      projects: number;
    };
  }) {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      avatarUrl: team.avatarUrl,
      creatorId: team.creatorId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      myRole: team.members[0]?.role ?? null,
      membersCount: team._count.members,
      projectsCount: team._count.projects,
    };
  }
}
