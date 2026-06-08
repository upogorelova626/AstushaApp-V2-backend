import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import {
  AddProjectTeamDto,
  CreateProjectDto,
  ProjectIdParamDto,
  ProjectTeamParamDto,
  SearchProjectTeamCandidatesDto,
  UpdateProjectDto,
} from './dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать проект' })
  createProject(@Body() dto: CreateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.createProject(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить проекты текущего пользователя' })
  getProjects(@Req() req: RequestWithUser) {
    return this.projectsService.getProjects(req.user.id);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Получить проект по ID' })
  getProjectById(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getProjectById(params.projectId, req.user.id);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Обновить проект' })
  updateProject(
    @Param() params: ProjectIdParamDto,
    @Body() dto: UpdateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.updateProject(
      params.projectId,
      dto,
      req.user.id,
    );
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить проект' })
  deleteProject(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.deleteProject(params.projectId, req.user.id);
  }

  @Patch(':projectId/complete')
  @ApiOperation({ summary: 'Завершить проект' })
  completeProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.projectsService.completeProject(projectId, req.user.id);
  }

  @Get(':projectId/board')
  @ApiOperation({ summary: 'Получить доску проекта' })
  getProjectBoard(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getProjectBoard(params.projectId, req.user.id);
  }

  @Get(':projectId/members')
  @ApiOperation({ summary: 'Получить участников проекта' })
  getProjectMembers(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getProjectMembers(
      params.projectId,
      req.user.id,
    );
  }

  @Get(':projectId/assignee-candidates')
  @ApiOperation({ summary: 'Получить кандидатов в исполнители задач' })
  getAssigneeCandidates(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getAssigneeCandidates(
      params.projectId,
      req.user.id,
    );
  }

  @Get(':projectId/team-candidates')
  @ApiOperation({ summary: 'Найти команды, которые можно добавить в проект' })
  getProjectTeamCandidates(
    @Param() params: ProjectIdParamDto,
    @Query() query: SearchProjectTeamCandidatesDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getProjectTeamCandidates(
      params.projectId,
      query.search,
      req.user.id,
    );
  }

  @Get(':projectId/team')
  @ApiOperation({ summary: 'Получить команду проекта' })
  getProjectTeam(
    @Param() params: ProjectIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.getProjectTeam(params.projectId, req.user.id);
  }

  @Post(':projectId/teams')
  @ApiOperation({ summary: 'Добавить команду в проект' })
  addTeamToProject(
    @Param() params: ProjectIdParamDto,
    @Body() dto: AddProjectTeamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.addTeamToProject(
      params.projectId,
      dto,
      req.user.id,
    );
  }

  @Delete(':projectId/teams/:teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить команду из проекта' })
  removeTeamFromProject(
    @Param() params: ProjectTeamParamDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.removeTeamFromProject(
      params.projectId,
      params.teamId,
      req.user.id,
    );
  }
}
