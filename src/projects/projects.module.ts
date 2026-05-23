import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectTasksController } from './project-tasks.controller';
import { ProjectTasksService } from './project-tasks.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProjectsController, ProjectTasksController],
  providers: [ProjectsService, ProjectTasksService],
})
export class ProjectsModule {}
