import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

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

    attachments: {
      orderBy: {
        createdAt: 'desc',
      },
      select: this.taskAttachmentSelect,
    },
  } as const;

  getMyTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assigneeId: userId,

        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: this.taskInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMyTaskById(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        assigneeId: userId,

        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: this.taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }
}
