import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('my')
  @ApiOperation({
    summary: 'Получить задачи, назначенные на текущего пользователя',
  })
  getMyTasks(@Req() req: RequestWithUser) {
    return this.tasksService.getMyTasks(req.user.id);
  }

  @Get('my/:taskId')
  @ApiOperation({
    summary: 'Получить одну задачу, назначенную на текущего пользователя',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID задачи',
  })
  getMyTaskById(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.getMyTaskById(taskId, req.user.id);
  }
}
