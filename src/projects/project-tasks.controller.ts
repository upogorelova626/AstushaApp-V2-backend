import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import {
  CreateProjectTaskDto,
  MoveProjectTaskDto,
  ProjectIdParamDto,
  ProjectTaskParamDto,
  UpdateProjectTaskDto,
} from './dto';
import { ProjectTasksService } from './project-tasks.service';

@ApiTags('project-tasks')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) {}

  @Post()
  @ApiOperation({ summary: 'Создать задачу в проекте' })
  createTask(
    @Param() params: ProjectIdParamDto,
    @Body() dto: CreateProjectTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectTasksService.createTask(
      params.projectId,
      dto,
      req.user.id,
    );
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Получить задачу проекта по ID' })
  getTaskById(
    @Param() params: ProjectTaskParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectTasksService.getTaskById(
      params.projectId,
      params.taskId,
      req.user.id,
    );
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Обновить задачу проекта' })
  updateTask(
    @Param() params: ProjectTaskParamDto,
    @Body() dto: UpdateProjectTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectTasksService.updateTask(
      params.projectId,
      params.taskId,
      dto,
      req.user.id,
    );
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить задачу проекта' })
  deleteTask(
    @Param() params: ProjectTaskParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectTasksService.deleteTask(
      params.projectId,
      params.taskId,
      req.user.id,
    );
  }

  @Patch(':taskId/move')
  @ApiOperation({ summary: 'Переместить задачу в другую стадию workflow' })
  moveTask(
    @Param() params: ProjectTaskParamDto,
    @Body() dto: MoveProjectTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectTasksService.moveTask(
      params.projectId,
      params.taskId,
      dto,
      req.user.id,
    );
  }
}
