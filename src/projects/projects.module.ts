import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectTasksController } from './project-tasks.controller';
import { ProjectTasksService } from './project-tasks.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepositoriesController } from './project-repositories.controller';
import { ProjectRepositoriesService } from './project-repositories.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    ProjectsController,
    ProjectTasksController,
    ProjectRepositoriesController,
  ],
  providers: [ProjectsService, ProjectTasksService, ProjectRepositoriesService],
})
export class ProjectsModule {}
