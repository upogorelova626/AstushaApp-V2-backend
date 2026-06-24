import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { TaskCommentParamDto } from './dto/task-comment-param.dro';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { TaskCommentsService } from './task-comments.service';

@ApiTags('Task comments')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии задачи' })
  getComments(
    @Param() params: TaskCommentParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.taskCommentsService.getComments(
      params.projectId,
      params.taskId,
      req.user.id,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Создать комментарий к задаче' })
  createComment(
    @Param() params: TaskCommentParamDto,
    @Body() dto: CreateTaskCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.taskCommentsService.createComment(
      params.projectId,
      params.taskId,
      dto,
      req.user.id,
    );
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Обновить комментарий задачи' })
  updateComment(
    @Param() params: TaskCommentParamDto,
    @Body() dto: UpdateTaskCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.taskCommentsService.updateComment(
      params.projectId,
      params.taskId,
      this.getCommentId(params),
      dto,
      req.user.id,
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Удалить комментарий задачи' })
  deleteComment(
    @Param() params: TaskCommentParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.taskCommentsService.deleteComment(
      params.projectId,
      params.taskId,
      this.getCommentId(params),
      req.user.id,
    );
  }

  private getCommentId(params: TaskCommentParamDto): string {
    if (!params.commentId) {
      throw new BadRequestException('ID комментария не передан');
    }

    return params.commentId;
  }
}
