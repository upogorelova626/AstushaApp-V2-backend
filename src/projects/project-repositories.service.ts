import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectRepositoryDto } from './dto/create-project-repository.dto';
import { UpdateProjectRepositoryDto } from './dto/update-project-repository.dto';
import { ProjectRole } from 'src/generated/prisma/client';

@Injectable()
export class ProjectRepositoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectRepositories(projectId: string, userId: string) {
    await this.checkIsProjectMember(projectId, userId);

    return this.prisma.projectRepository.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createProjectRepository(
    projectId: string,
    userId: string,
    dto: CreateProjectRepositoryDto,
  ) {
    await this.checkCanManageProjectRepositories(projectId, userId);

    try {
      return await this.prisma.projectRepository.create({
        data: {
          projectId,
          url: dto.url.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Этот репозиторий уже добавлен к проекту',
        );
      }

      throw error;
    }
  }

  async updateProjectRepository(
    projectId: string,
    repositoryId: string,
    userId: string,
    dto: UpdateProjectRepositoryDto,
  ) {
    await this.checkCanManageProjectRepositories(projectId, userId);
    await this.getProjectRepositoryOrThrow(projectId, repositoryId);

    try {
      return await this.prisma.projectRepository.update({
        where: {
          id: repositoryId,
        },
        data: {
          url: dto.url?.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Этот репозиторий уже добавлен к проекту',
        );
      }

      throw error;
    }
  }

  async deleteProjectRepository(
    projectId: string,
    repositoryId: string,
    userId: string,
  ) {
    await this.checkCanManageProjectRepositories(projectId, userId);
    await this.getProjectRepositoryOrThrow(projectId, repositoryId);

    await this.prisma.projectRepository.delete({
      where: {
        id: repositoryId,
      },
    });

    return {
      success: true,
    };
  }

  private async getProjectRepositoryOrThrow(
    projectId: string,
    repositoryId: string,
  ) {
    const repository = await this.prisma.projectRepository.findFirst({
      where: {
        id: repositoryId,
        projectId,
      },
    });

    if (!repository) {
      throw new NotFoundException('Репозиторий проекта не найден');
    }

    return repository;
  }

  private async checkIsProjectMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Нет доступа к проекту');
    }

    return member;
  }

  private async checkCanManageProjectRepositories(
    projectId: string,
    userId: string,
  ) {
    const member = await this.checkIsProjectMember(projectId, userId);

    if (
      member.role !== ProjectRole.OWNER &&
      member.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Недостаточно прав для управления репозиториями проекта',
      );
    }

    return member;
  }
}
