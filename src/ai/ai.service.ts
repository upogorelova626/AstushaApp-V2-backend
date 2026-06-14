import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AiMessageRole } from '../generated/prisma/enums';
import { CreateAiChatDto } from './dto/create-ai-chat-dto';
import { SendAiMessageDto } from './dto/send-ai-message.dto';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  getChats(userId: string) {
    return this.prisma.aiChat.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        taskId: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createChat(userId: string, dto: CreateAiChatDto) {
    const context = await this.resolveContext(userId, dto);

    return this.prisma.aiChat.create({
      data: {
        userId,
        title: this.getChatTitle(dto.title, context),
        projectId: context.projectId,
        taskId: context.taskId,
      },
      select: this.chatDetailsSelect(),
    });
  }

  async getChat(userId: string, chatId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: this.chatDetailsSelect(),
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  async sendMessage(userId: string, chatId: string, dto: SendAiMessageDto) {
    const chat = await this.prisma.aiChat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: {
        id: true,
        project: {
          select: {
            title: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    const content = dto.content.trim();

    if (!content) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    const userMessage = await this.prisma.aiMessage.create({
      data: {
        chatId,
        role: AiMessageRole.USER,
        content,
      },
    });

    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        chatId,
        role: AiMessageRole.ASSISTANT,
        content: this.createMockAnswer(content, chat),
      },
    });

    await this.prisma.aiChat.update({
      where: {
        id: chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  async deleteChat(userId: string, chatId: string) {
    const chat = await this.prisma.aiChat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    await this.prisma.aiChat.delete({
      where: {
        id: chatId,
      },
    });

    return {
      success: true,
    };
  }

  private chatDetailsSelect() {
    return {
      id: true,
      title: true,
      userId: true,
      projectId: true,
      taskId: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'asc' as const,
        },
        select: {
          id: true,
          chatId: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    };
  }

  private async resolveContext(userId: string, dto: CreateAiChatDto) {
    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: {
          id: dto.taskId,
        },
        select: {
          id: true,
          title: true,
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              creatorId: true,
              members: {
                where: {
                  userId,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Задача не найдена');
      }

      this.checkProjectAccess(
        userId,
        task.project.creatorId,
        task.project.members.length,
      );

      return {
        projectId: task.projectId,
        projectTitle: task.project.title,
        taskId: task.id,
        taskTitle: task.title,
      };
    }

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: {
          id: dto.projectId,
        },
        select: {
          id: true,
          title: true,
          creatorId: true,
          members: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Проект не найден');
      }

      this.checkProjectAccess(
        userId,
        project.creatorId,
        project.members.length,
      );

      return {
        projectId: project.id,
        projectTitle: project.title,
        taskId: null,
        taskTitle: null,
      };
    }

    return {
      projectId: null,
      projectTitle: null,
      taskId: null,
      taskTitle: null,
    };
  }

  private checkProjectAccess(
    userId: string,
    creatorId: string,
    membersCount: number,
  ): void {
    const isCreator = creatorId === userId;
    const isMember = membersCount > 0;

    if (!isCreator && !isMember) {
      throw new ForbiddenException('Нет доступа к проекту');
    }
  }

  private getChatTitle(
    title: string | undefined,
    context: {
      projectTitle: string | null;
      taskTitle: string | null;
    },
  ): string {
    const trimmedTitle = title?.trim();

    if (trimmedTitle) {
      return trimmedTitle;
    }

    if (context.taskTitle) {
      return context.taskTitle;
    }

    if (context.projectTitle) {
      return `Чат по проекту ${context.projectTitle}`;
    }

    return 'Новый чат';
  }

  private createMockAnswer(
    message: string,
    chat: {
      project: { title: string } | null;
      task: { title: string } | null;
    },
  ): string {
    const context = [
      chat.project?.title ? `Проект: ${chat.project.title}` : null,
      chat.task?.title ? `Задача: ${chat.task.title}` : null,
    ].filter(Boolean);

    return [
      `Я пока работаю в моковом режиме.`,
      `Получил сообщение: "${message}".`,
      context.length ? `Контекст: ${context.join(', ')}.` : null,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
