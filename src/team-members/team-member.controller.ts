import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { AddTeamMemberDto } from './add-team-member.dto';
import { LookupTeamMemberCandidateQueryDto } from './lookup-team-member-candidate-query.dto';
import { TeamMembersService } from './team-member.service';
import { UpdateTeamMemberDto } from './update-team-member.dto';

@ApiTags('team-members')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @ApiOperation({
    summary: 'Найти пользователя для добавления в команду',
  })
  @ApiQuery({
    name: 'identifier',
    description: 'Email или логин пользователя',
    example: 'astusha@example.com',
  })
  @Get('lookup')
  lookupTeamMemberCandidate(
    @Req() request: AuthRequest,
    @Param('teamId') teamId: string,
    @Query() query: LookupTeamMemberCandidateQueryDto,
  ) {
    return this.teamMembersService.lookupTeamMemberCandidate(
      request.user.id,
      teamId,
      query.identifier,
    );
  }

  @ApiOperation({ summary: 'Получить участников команды' })
  @Get()
  getTeamMembers(@Req() request: AuthRequest, @Param('teamId') teamId: string) {
    return this.teamMembersService.getTeamMembers(request.user.id, teamId);
  }

  @ApiOperation({ summary: 'Добавить участника в команду' })
  @Post()
  addTeamMember(
    @Req() request: AuthRequest,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.teamMembersService.addTeamMember(request.user.id, teamId, dto);
  }

  @ApiOperation({ summary: 'Изменить роль участника команды' })
  @Patch(':memberId')
  updateTeamMember(
    @Req() request: AuthRequest,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamMembersService.updateTeamMember(
      request.user.id,
      teamId,
      memberId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Удалить участника из команды' })
  @Delete(':memberId')
  deleteTeamMember(
    @Req() request: AuthRequest,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamMembersService.deleteTeamMember(
      request.user.id,
      teamId,
      memberId,
    );
  }
}
