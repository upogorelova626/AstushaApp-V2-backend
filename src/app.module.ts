import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks/tasks.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { TaskCommentsModule } from './task-comments/task-comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TeamsModule,
    TeamMembersModule,
    ProjectsModule,
    TasksModule,
    StorageModule,
    AiModule,
    TaskCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
