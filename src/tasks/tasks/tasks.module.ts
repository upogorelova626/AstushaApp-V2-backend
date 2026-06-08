import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';
import { TaskAttachmentsController } from './tas-attachment.controller';
import { TaskAttachmentsService } from './task-attachment.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule],
  controllers: [TasksController, TaskAttachmentsController],
  providers: [TasksService, TaskAttachmentsService],
})
export class TasksModule {}
