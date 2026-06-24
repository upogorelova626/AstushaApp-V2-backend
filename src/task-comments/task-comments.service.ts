import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProjectRole, ProjectStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';

@Injectable()
export class TaskCommentsService {
  private readonly commentSelect = {
    id: true,
    text: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getComments(projectId: string, taskId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.getTaskOrThrow(projectId, taskId);

    return this.prisma.taskComment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: this.commentSelect,
    });
  }

  async createComment(
    projectId: string,
    taskId: string,
    dto: CreateTaskCommentDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    return this.prisma.taskComment.create({
      data: {
        taskId,
        authorId: userId,
        text: dto.text,
      },
      select: this.commentSelect,
    });
  }

  async updateComment(
    projectId: string,
    taskId: string,
    commentId: string,
    dto: UpdateTaskCommentDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    const comment = await this.getCommentOrThrow(taskId, commentId);

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Можно редактировать только свой комментарий',
      );
    }

    return this.prisma.taskComment.update({
      where: {
        id: comment.id,
      },
      data: {
        text: dto.text,
      },
      select: this.commentSelect,
    });
  }

  async deleteComment(
    projectId: string,
    taskId: string,
    commentId: string,
    userId: string,
  ) {
    const projectMember = await this.getProjectMemberOrThrow(projectId, userId);

    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    const comment = await this.getCommentOrThrow(taskId, commentId);

    const canDelete =
      comment.authorId === userId ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN;

    if (!canDelete) {
      throw new ForbiddenException(
        'Недостаточно прав для удаления комментария',
      );
    }

    await this.prisma.taskComment.delete({
      where: {
        id: comment.id,
      },
    });

    return {
      success: true,
    };
  }

  private async getProjectMemberOrThrow(projectId: string, userId: string) {
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('Нет доступа к проекту');
    }

    return projectMember;
  }

  private async assertProjectIsActive(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      throw new ForbiddenException('Проект завершён');
    }

    return project;
  }

  private async getTaskOrThrow(projectId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }

  private async getCommentOrThrow(taskId: string, commentId: string) {
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }
}
