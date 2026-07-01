import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamMembersController } from './team-member.controller';
import { TeamMembersService } from './team-member.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule {}
