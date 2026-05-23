import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ProjectRole,
  ProjectWorkflowType,
  TeamRole,
} from 'src/generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';
import { AddProjectTeamDto, CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(dto: CreateProjectDto, userId: string) {
    this.validateProjectDates(dto.startDate, dto.deadline);

    const existingProject = await this.prisma.project.findUnique({
      where: {
        key: dto.key,
      },
      select: {
        id: true,
      },
    });

    if (existingProject) {
      throw new ConflictException('Project with this key already exists');
    }

    const workflowType = dto.workflowType ?? ProjectWorkflowType.SIMPLE;
    const workflowStages = this.createWorkflowStagesData(workflowType);

    return this.prisma.project.create({
      data: {
        title: dto.title,
        key: dto.key,
        description: dto.description,
        workflowType,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,

        creator: {
          connect: {
            id: userId,
          },
        },

        members: {
          create: {
            role: ProjectRole.OWNER,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },

        workflowStages: {
          create: workflowStages,
        },
      },
      include: this.projectInclude,
    });
  }

  async getProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        creator: {
          select: this.userSelect,
        },
        _count: {
          select: {
            members: true,
            teams: true,
            tasks: true,
          },
        },
      },
    });
  }

  async getProjectById(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
    userId: string,
  ) {
    await this.assertCanManageProject(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        startDate: true,
        deadline: true,
        workflowType: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const nextStartDate =
      dto.startDate !== undefined ? new Date(dto.startDate) : project.startDate;

    const nextDeadline =
      dto.deadline !== undefined ? new Date(dto.deadline) : project.deadline;

    this.validateProjectDateObjects(nextStartDate, nextDeadline);

    const shouldChangeWorkflowType =
      dto.workflowType !== undefined &&
      dto.workflowType !== project.workflowType;

    if (shouldChangeWorkflowType) {
      const tasksCount = await this.prisma.task.count({
        where: {
          projectId,
        },
      });

      if (tasksCount > 0) {
        throw new BadRequestException(
          'Cannot change workflow type because project already has tasks',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          title: dto.title,
          description: dto.description,
          priority: dto.priority,
          workflowType: dto.workflowType,
          startDate: dto.startDate !== undefined ? nextStartDate : undefined,
          deadline: dto.deadline !== undefined ? nextDeadline : undefined,
        },
      });

      if (shouldChangeWorkflowType && dto.workflowType) {
        await tx.projectWorkflowStage.deleteMany({
          where: {
            projectId,
          },
        });

        await tx.projectWorkflowStage.createMany({
          data: this.createWorkflowStagesData(dto.workflowType).map(
            (stage) => ({
              projectId,
              ...stage,
            }),
          ),
        });
      }

      return tx.project.findUnique({
        where: {
          id: updatedProject.id,
        },
        include: this.projectInclude,
      });
    });
  }

  async deleteProject(projectId: string, userId: string) {
    await this.assertProjectOwner(projectId, userId);

    await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }

  async getProjectBoard(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    return this.prisma.projectWorkflowStage.findMany({
      where: {
        projectId,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        tasks: {
          orderBy: [
            {
              position: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
          include: {
            createdBy: {
              select: this.userSelect,
            },
            assignee: {
              select: this.userSelect,
            },
          },
        },
      },
    });
  }

  async getProjectMembers(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    return this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  async getAssigneeCandidates(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    const projectMembers = await this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        user: {
          select: this.userSelect,
        },
      },
    });

    return projectMembers.map((projectMember) => projectMember.user);
  }

  async getProjectTeams(projectId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);

    return this.prisma.projectTeam.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        team: {
          include: {
            creator: {
              select: this.userSelect,
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });
  }

  async addTeamToProject(
    projectId: string,
    dto: AddProjectTeamDto,
    userId: string,
  ) {
    await this.assertCanManageProject(projectId, userId);
    await this.assertCanUseTeam(dto.teamId, userId);

    const existingProjectTeam = await this.prisma.projectTeam.findUnique({
      where: {
        projectId_teamId: {
          projectId,
          teamId: dto.teamId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingProjectTeam) {
      throw new ConflictException('Team already added to this project');
    }

    return this.prisma.$transaction(async (tx) => {
      const projectTeam = await tx.projectTeam.create({
        data: {
          project: {
            connect: {
              id: projectId,
            },
          },
          team: {
            connect: {
              id: dto.teamId,
            },
          },
        },
        include: {
          team: {
            include: {
              creator: {
                select: this.userSelect,
              },
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      });

      const teamMembers = await tx.teamMember.findMany({
        where: {
          teamId: dto.teamId,
        },
        select: {
          userId: true,
        },
      });

      if (teamMembers.length > 0) {
        await tx.projectMember.createMany({
          data: teamMembers.map((teamMember) => ({
            projectId,
            userId: teamMember.userId,
            role: ProjectRole.MEMBER,
          })),
          skipDuplicates: true,
        });
      }

      return projectTeam;
    });
  }

  async removeTeamFromProject(
    projectId: string,
    teamId: string,
    userId: string,
  ) {
    await this.assertCanManageProject(projectId, userId);

    const existingProjectTeam = await this.prisma.projectTeam.findUnique({
      where: {
        projectId_teamId: {
          projectId,
          teamId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingProjectTeam) {
      throw new NotFoundException('Team is not connected to this project');
    }

    await this.prisma.projectTeam.delete({
      where: {
        projectId_teamId: {
          projectId,
          teamId,
        },
      },
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

  private async assertCanManageProject(projectId: string, userId: string) {
    const projectMember = await this.getProjectMemberOrThrow(projectId, userId);

    if (
      projectMember.role !== ProjectRole.OWNER &&
      projectMember.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException('Only project owner or admin can do this');
    }

    return projectMember;
  }

  private async assertProjectOwner(projectId: string, userId: string) {
    const projectMember = await this.getProjectMemberOrThrow(projectId, userId);

    if (projectMember.role !== ProjectRole.OWNER) {
      throw new ForbiddenException('Only project owner can do this');
    }

    return projectMember;
  }

  private async assertCanUseTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.creatorId === userId) {
      return;
    }

    const teamMember = await this.prisma.teamMember.findUnique({
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

    if (
      !teamMember ||
      (teamMember.role !== TeamRole.OWNER && teamMember.role !== TeamRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only team owner or admin can add this team to project',
      );
    }
  }

  private validateProjectDates(startDate?: string, deadline?: string) {
    if (!startDate || !deadline) {
      return;
    }

    this.validateProjectDateObjects(new Date(startDate), new Date(deadline));
  }

  private validateProjectDateObjects(
    startDate: Date | null,
    deadline: Date | null,
  ) {
    if (!startDate || !deadline) {
      return;
    }

    if (deadline < startDate) {
      throw new BadRequestException(
        'Project deadline cannot be before start date',
      );
    }
  }

  private createWorkflowStagesData(workflowType: ProjectWorkflowType) {
    const stages = this.getDefaultWorkflowStages(workflowType);

    return stages.map((name, index) => ({
      name,
      position: index,
      isStart: index === 0,
      isFinal: index === stages.length - 1,
    }));
  }

  private getDefaultWorkflowStages(
    workflowType: ProjectWorkflowType,
  ): string[] {
    switch (workflowType) {
      case ProjectWorkflowType.DEVELOPMENT:
        return [
          'Backlog',
          'To Do',
          'In Progress',
          'Code Review',
          'Testing',
          'Done',
        ];

      case ProjectWorkflowType.DESIGN:
        return ['Ideas', 'Wireframe', 'Design', 'Review', 'Approved'];

      case ProjectWorkflowType.SIMPLE:
        return ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

      case ProjectWorkflowType.CUSTOM:
        throw new BadRequestException('Custom workflow is not supported yet');
    }
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

  private readonly projectInclude = {
    creator: {
      select: this.userSelect,
    },
    members: {
      include: {
        user: {
          select: this.userSelect,
        },
      },
    },
    teams: {
      include: {
        team: {
          include: {
            creator: {
              select: this.userSelect,
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    },
    workflowStages: {
      orderBy: {
        position: 'asc',
      },
    },
    _count: {
      select: {
        members: true,
        teams: true,
        tasks: true,
      },
    },
  } as const;
}
