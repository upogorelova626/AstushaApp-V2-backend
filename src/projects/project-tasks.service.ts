import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

  private async resolveWorkflowStage(
    projectId: string,
    workflowStageId?: string,
  ) {
    if (workflowStageId) {
      const workflowStage = await this.prisma.projectWorkflowStage.findFirst({
        where: {
          id: workflowStageId,
          projectId,
        },
      });

      if (!workflowStage) {
        throw new BadRequestException('Workflow-этап не найден в этом проекте');
      }

      return workflowStage;
    }

    const startWorkflowStage = await this.prisma.projectWorkflowStage.findFirst(
      {
        where: {
          projectId,
          isStart: true,
        },
      },
    );

    if (startWorkflowStage) {
      return startWorkflowStage;
    }

    const firstWorkflowStage = await this.prisma.projectWorkflowStage.findFirst(
      {
        where: {
          projectId,
        },
        orderBy: {
          position: 'asc',
        },
      },
    );

    if (!firstWorkflowStage) {
      throw new BadRequestException('У проекта нет workflow-этапов');
    }

    return firstWorkflowStage;
  }

  async getTaskById(projectId: string, taskId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: this.taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getProjectTasks(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    return this.prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: [
        {
          number: 'asc',
        },
      ],
      include: this.taskInclude,
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    dto: UpdateProjectTaskDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.getTaskOrThrow(projectId, taskId);

    await this.assertAssigneeBelongsToProject(projectId, dto.assigneeId);
    await this.assertSprintBelongsToProject(projectId, dto.sprintId);
    await this.assertParentTaskBelongsToProject(
      projectId,
      dto.parentId,
      taskId,
    );

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

        sprint:
          dto.sprintId !== undefined
            ? dto.sprintId
              ? {
                  connect: {
                    id: dto.sprintId,
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,

        parent:
          dto.parentId !== undefined
            ? dto.parentId
              ? {
                  connect: {
                    id: dto.parentId,
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
    await this.getTaskOrThrow(projectId, taskId);

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }

  async moveTask(
    projectId: string,
    taskId: string,
    dto: MoveProjectTaskDto,
    userId: string,
  ) {
    await this.getProjectMemberOrThrow(projectId, userId);

    const task = await this.getTaskOrThrow(projectId, taskId);

    const targetStage = await this.assertWorkflowStageBelongsToProject(
      projectId,
      dto.workflowStageId,
    );

    const nextPosition =
      dto.position !== undefined
        ? dto.position
        : task.workflowStageId === dto.workflowStageId
          ? task.position
          : await this.getNextTaskPosition(dto.workflowStageId);

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          position: nextPosition,
          workflowStage: {
            connect: {
              id: dto.workflowStageId,
            },
          },
        },
        include: this.taskInclude,
      });

      await tx.taskWorkflowHistory.create({
        data: {
          task: {
            connect: {
              id: taskId,
            },
          },

          fromStage: {
            connect: {
              id: task.workflowStageId,
            },
          },

          toStage: {
            connect: {
              id: dto.workflowStageId,
            },
          },

          fromStageName: task.workflowStage.name,
          toStageName: targetStage.name,

          movedBy: {
            connect: {
              id: userId,
            },
          },

          previousPosition: task.position,
          newPosition: nextPosition,
        },
      });

      return updatedTask;
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
    });

    if (projectMember) {
      return projectMember;
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    throw new ForbiddenException('You are not a member of this project');
  }

  private async getTaskOrThrow(projectId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: {
        id: true,
        position: true,
        workflowStageId: true,
        workflowStage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async assertWorkflowStageBelongsToProject(
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
        name: true,
        position: true,
        isStart: true,
        isFinal: true,
      },
    });

    if (!workflowStage) {
      throw new NotFoundException('Workflow stage not found in this project');
    }

    return workflowStage;
  }

  private async assertAssigneeBelongsToProject(
    projectId: string,
    assigneeId?: string | null,
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
      throw new BadRequestException('Assignee is not a member of this project');
    }
  }

  private async assertSprintBelongsToProject(
    projectId: string,
    sprintId?: string | null,
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
      throw new BadRequestException('Sprint not found in this project');
    }
  }

  private async assertParentTaskBelongsToProject(
    projectId: string,
    parentId?: string | null,
    currentTaskId?: string,
  ) {
    if (!parentId) {
      return;
    }

    if (currentTaskId && parentId === currentTaskId) {
      throw new BadRequestException('Task cannot be parent of itself');
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
      throw new BadRequestException('Parent task not found in this project');
    }
  }

  private async getNextTaskNumber(projectId: string) {
    const aggregate = await this.prisma.task.aggregate({
      where: {
        projectId,
      },
      _max: {
        number: true,
      },
    });

    return (aggregate._max.number ?? 0) + 1;
  }

  private async getNextTaskPosition(workflowStageId: string) {
    const aggregate = await this.prisma.task.aggregate({
      where: {
        workflowStageId,
      },
      _max: {
        position: true,
      },
    });

    return (aggregate._max.position ?? -1) + 1;
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

  private readonly taskInclude = {
    createdBy: {
      select: this.userSelect,
    },
    assignee: {
      select: this.userSelect,
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
    sprint: {
      select: {
        id: true,
        name: true,
        goal: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    },
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
    _count: {
      select: {
        comments: true,
        attachments: true,
        subtasks: true,
      },
    },
  } as const;
}
