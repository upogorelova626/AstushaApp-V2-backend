import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProjectRole } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class TaskAttachmentsService {
  private readonly attachmentSelect = {
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
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadAttachments(
    projectId: string,
    taskId: string,
    userId: string,
    files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      throw new BadRequestException('Файлы не переданы');
    }

    await this.getProjectMemberOrThrow(projectId, userId);
    await this.getTaskOrThrow(projectId, taskId);

    const uploadedStorageKeys: string[] = [];
    const createdAttachmentIds: string[] = [];

    try {
      for (const file of files) {
        const uploadedFile = await this.storageService.uploadFile(
          file,
          `projects/${projectId}/tasks/${taskId}/attachments`,
        );

        uploadedStorageKeys.push(uploadedFile.key);

        const attachment = await this.prisma.taskAttachment.create({
          data: {
            taskId,
            uploaderId: userId,
            originalName: this.normalizeFileName(uploadedFile.originalName),
            storageKey: uploadedFile.key,
            fileUrl: uploadedFile.url,
            mimeType: uploadedFile.mimeType,
            size: uploadedFile.size,
          },
          select: this.attachmentSelect,
        });

        createdAttachmentIds.push(attachment.id);
      }

      return this.prisma.taskAttachment.findMany({
        where: {
          id: {
            in: createdAttachmentIds,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: this.attachmentSelect,
      });
    } catch (error) {
      await Promise.allSettled(
        uploadedStorageKeys.map((storageKey) =>
          this.storageService.deleteFile(storageKey),
        ),
      );

      throw error;
    }
  }

  async getAttachments(projectId: string, taskId: string, userId: string) {
    await this.getProjectMemberOrThrow(projectId, userId);
    await this.getTaskOrThrow(projectId, taskId);

    return this.prisma.taskAttachment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: this.attachmentSelect,
    });
  }

  async deleteAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string,
    userId: string,
  ) {
    const projectMember = await this.getProjectMemberOrThrow(projectId, userId);

    await this.getTaskOrThrow(projectId, taskId);

    const attachment = await this.prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
      },
      select: {
        id: true,
        uploaderId: true,
        storageKey: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Файл не найден');
    }

    const canDelete =
      attachment.uploaderId === userId ||
      projectMember.role === ProjectRole.OWNER ||
      projectMember.role === ProjectRole.ADMIN;

    if (!canDelete) {
      throw new ForbiddenException('Недостаточно прав для удаления файла');
    }

    await this.prisma.taskAttachment.delete({
      where: {
        id: attachment.id,
      },
    });

    await this.storageService.deleteFile(attachment.storageKey);

    return {
      success: true,
    };
  }

  private normalizeFileName(fileName: string): string {
    if (!this.hasBrokenCyrillicEncoding(fileName)) {
      return fileName;
    }

    const decodedFileName = Buffer.from(fileName, 'latin1').toString('utf8');

    if (decodedFileName.includes('�')) {
      return fileName;
    }

    return decodedFileName;
  }

  private hasBrokenCyrillicEncoding(fileName: string): boolean {
    return /[ÐÑ]/.test(fileName);
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
}
