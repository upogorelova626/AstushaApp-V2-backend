import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TaskAttachmentsService } from './task-attachment.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('projects/:projectId/tasks/:taskId/attachments')
@UseGuards(JwtAuthGuard)
export class TaskAttachmentsController {
  constructor(
    private readonly taskAttachmentsService: TaskAttachmentsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Загрузить файлы задачи',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadAttachments(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.taskAttachmentsService.uploadAttachments(
      projectId,
      taskId,
      req.user.id,
      files,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Получить файлы задачи',
  })
  getAttachments(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.taskAttachmentsService.getAttachments(
      projectId,
      taskId,
      req.user.id,
    );
  }

  @Delete(':attachmentId')
  @ApiOperation({
    summary: 'Удалить файл задачи',
  })
  deleteAttachment(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.taskAttachmentsService.deleteAttachment(
      projectId,
      taskId,
      attachmentId,
      req.user.id,
    );
  }
}
