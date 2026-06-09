import {
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
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { CreateProjectRepositoryDto } from './dto/create-project-repository.dto';
import { UpdateProjectRepositoryDto } from './dto/update-project-repository.dto';
import { ProjectRepositoriesService } from './project-repositories.service';

@ApiTags('Project repositories')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/repositories')
export class ProjectRepositoriesController {
  constructor(
    private readonly projectRepositoriesService: ProjectRepositoriesService,
  ) {}

  @Get()
  getProjectRepositories(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.projectRepositoriesService.getProjectRepositories(
      projectId,
      req.user.id,
    );
  }

  @Post()
  createProjectRepository(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithUser,
    @Body() dto: CreateProjectRepositoryDto,
  ) {
    return this.projectRepositoriesService.createProjectRepository(
      projectId,
      req.user.id,
      dto,
    );
  }

  @Patch(':repositoryId')
  updateProjectRepository(
    @Param('projectId') projectId: string,
    @Param('repositoryId') repositoryId: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProjectRepositoryDto,
  ) {
    return this.projectRepositoriesService.updateProjectRepository(
      projectId,
      repositoryId,
      req.user.id,
      dto,
    );
  }

  @Delete(':repositoryId')
  deleteProjectRepository(
    @Param('projectId') projectId: string,
    @Param('repositoryId') repositoryId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.projectRepositoriesService.deleteProjectRepository(
      projectId,
      repositoryId,
      req.user.id,
    );
  }
}
