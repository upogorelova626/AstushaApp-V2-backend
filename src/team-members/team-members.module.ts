import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TeamMembersController } from './team-member.controller';
import { TeamMembersService } from './team-member.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule {}
