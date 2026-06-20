import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProjectStatus } from 'src/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectTaskDto,
  MoveProjectTaskDto,
  UpdateProjectTaskDto,
} from './dto';

@Injectable()
export class ProjectTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(
    projectId: string,
    dto: CreateProjectTaskDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);

    if (!dto.workflowStageId) {
      throw new BadRequestException('Стадия workflow обязательна');
    }

    const workflowStage = await this.resolveWorkflowStage(
      projectId,
      dto.workflowStageId,
    );

    await this.assertAssigneeBelongsToProject(projectId, dto.assigneeId);
    await this.assertSprintBelongsToProject(projectId, dto.sprintId);
    await this.assertParentTaskBelongsToProject(projectId, dto.parentId);

    const nextNumber = await this.getNextTaskNumber(projectId);
    const nextPosition = await this.getNextTaskPosition(workflowStage.id);

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        storyPoints: dto.storyPoints,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,

        number: nextNumber,
        position: nextPosition,

        project: {
          connect: {
            id: projectId,
          },
        },

        workflowStage: {
          connect: {
            id: workflowStage.id,
          },
        },

        createdBy: {
          connect: {
            id: userId,
          },
        },

        assignee: dto.assigneeId
          ? {
              connect: {
                id: dto.assigneeId,
              },
            }
          : undefined,

        sprint: dto.sprintId
          ? {
              connect: {
                id: dto.sprintId,
              },
            }
          : undefined,

        parent: dto.parentId
          ? {
              connect: {
                id: dto.parentId,
              },
            }
          : undefined,
      },
      include: this.taskInclude,
    });
  }

  async getProjectTasks(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    return this.prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: [
        {
          workflowStage: {
            position: 'asc',
          },
        },
        {
          position: 'asc',
        },
      ],
      include: this.taskInclude,
    });
  }

  async getProjectTaskById(projectId: string, taskId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: this.taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }

  async updateTask(
    projectId: string,
    taskId: string,
    dto: UpdateProjectTaskDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    if (dto.assigneeId) {
      await this.assertAssigneeBelongsToProject(projectId, dto.assigneeId);
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        storyPoints: dto.storyPoints,
        dueDate:
          dto.dueDate !== undefined
            ? dto.dueDate
              ? new Date(dto.dueDate)
              : null
            : undefined,

        assignee:
          dto.assigneeId !== undefined
            ? dto.assigneeId
              ? {
                  connect: {
                    id: dto.assigneeId,
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,
      },
      include: this.taskInclude,
    });
  }

  async deleteTask(projectId: string, taskId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return {
      success: true,
    };
  }

  async moveTask(
    projectId: string,
    taskId: string,
    dto: MoveProjectTaskDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.assertProjectIsActive(projectId);
    await this.getTaskOrThrow(projectId, taskId);

    const workflowStage = await this.resolveWorkflowStage(
      projectId,
      dto.workflowStageId,
    );

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        workflowStageId: workflowStage.id,
        position: dto.position,
      },
      include: this.taskInclude,
    });
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

    if (project.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException('Нельзя изменять завершённый проект');
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

  private async resolveWorkflowStage(
    projectId: string,
    workflowStageId: string,
  ) {
    const workflowStage = await this.prisma.projectWorkflowStage.findFirst({
      where: {
        id: workflowStageId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!workflowStage) {
      throw new NotFoundException('Стадия workflow не найдена');
    }

    return workflowStage;
  }

  private async assertAssigneeBelongsToProject(
    projectId: string,
    assigneeId?: string,
  ) {
    if (!assigneeId) {
      return;
    }

    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assigneeId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!projectMember) {
      throw new BadRequestException(
        'Исполнитель не является участником проекта',
      );
    }
  }

  private async assertSprintBelongsToProject(
    projectId: string,
    sprintId?: string,
  ) {
    if (!sprintId) {
      return;
    }

    const sprint = await this.prisma.sprint.findFirst({
      where: {
        id: sprintId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!sprint) {
      throw new BadRequestException('Спринт не принадлежит проекту');
    }
  }

  private async assertParentTaskBelongsToProject(
    projectId: string,
    parentId?: string,
    currentTaskId?: string,
  ) {
    if (!parentId) {
      return;
    }

    if (parentId === currentTaskId) {
      throw new BadRequestException(
        'Задача не может быть родителем самой себя',
      );
    }

    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: parentId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!parentTask) {
      throw new BadRequestException('Родительская задача не найдена');
    }
  }

  private async getNextTaskNumber(projectId: string) {
    const lastTask = await this.prisma.task.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        number: 'desc',
      },
      select: {
        number: true,
      },
    });

    return (lastTask?.number ?? 0) + 1;
  }

  private async getNextTaskPosition(workflowStageId: string) {
    const lastTask = await this.prisma.task.findFirst({
      where: {
        workflowStageId,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    return (lastTask?.position ?? 0) + 1;
  }

  private readonly userSelect = {
    id: true,
    login: true,
    email: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    position: true,
    about: true,
  } as const;

  private readonly taskAttachmentSelect = {
    id: true,
    originalName: true,
    storageKey: true,
    fileUrl: true,
    mimeType: true,
    size: true,
    createdAt: true,
    uploader: {
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  } as const;

  private readonly taskInclude = {
    project: {
      select: {
        id: true,
        title: true,
        key: true,
        status: true,
        priority: true,
        startDate: true,
        deadline: true,
      },
    },

    workflowStage: {
      select: {
        id: true,
        name: true,
        position: true,
        isStart: true,
        isFinal: true,
      },
    },

    createdBy: {
      select: this.userSelect,
    },

    assignee: {
      select: this.userSelect,
    },

    sprint: true,

    parent: {
      select: {
        id: true,
        number: true,
        title: true,
      },
    },

    subtasks: {
      select: {
        id: true,
        number: true,
        title: true,
        position: true,
      },
      orderBy: {
        position: 'asc',
      },
    },

    attachments: {
      orderBy: {
        createdAt: 'desc',
      },
      select: this.taskAttachmentSelect,
    },

    _count: {
      select: {
        comments: true,
        attachments: true,
        subtasks: true,
      },
    },
  } as const;
}
