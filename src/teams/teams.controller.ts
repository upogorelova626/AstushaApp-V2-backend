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
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { CreateTeamDto } from './create-team.dto';
import { UpdateTeamDto } from './update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'Создать команду' })
  @Post()
  createTeam(@Req() request: AuthRequest, @Body() dto: CreateTeamDto) {
    return this.teamsService.createTeam(request.user.id, dto);
  }

  @ApiOperation({ summary: 'Получить мои команды' })
  @Get()
  getMyTeams(@Req() request: AuthRequest) {
    return this.teamsService.getMyTeams(request.user.id);
  }

  @ApiOperation({ summary: 'Получить команду по id' })
  @Get(':teamId')
  getTeamById(@Req() request: AuthRequest, @Param('teamId') teamId: string) {
    return this.teamsService.getTeamById(request.user.id, teamId);
  }

  @ApiOperation({ summary: 'Обновить команду' })
  @Patch(':teamId')
  updateTeam(
    @Req() request: AuthRequest,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.updateTeam(request.user.id, teamId, dto);
  }

  @ApiOperation({ summary: 'Удалить команду' })
  @Delete(':teamId')
  deleteTeam(@Req() request: AuthRequest, @Param('teamId') teamId: string) {
    return this.teamsService.deleteTeam(request.user.id, teamId);
  }
}
