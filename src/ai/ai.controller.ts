import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { AiService } from './ai.service';
import { CreateAiChatDto } from './dto/create-ai-chat-dto';
import { SendAiMessageDto } from './dto/send-ai-message.dto';

@ApiTags('ai')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Получить список AI-чатов' })
  @Get('chats')
  getChats(@Req() request: AuthRequest) {
    return this.aiService.getChats(request.user.id);
  }

  @ApiOperation({ summary: 'Создать AI-чат' })
  @Post('chats')
  createChat(@Req() request: AuthRequest, @Body() dto: CreateAiChatDto) {
    return this.aiService.createChat(request.user.id, dto);
  }

  @ApiOperation({ summary: 'Получить AI-чат с сообщениями' })
  @Get('chats/:chatId')
  getChat(
    @Req() request: AuthRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.aiService.getChat(request.user.id, chatId);
  }

  @ApiOperation({ summary: 'Отправить сообщение в AI-чат' })
  @Post('chats/:chatId/messages')
  sendMessage(
    @Req() request: AuthRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: SendAiMessageDto,
  ) {
    return this.aiService.sendMessage(request.user.id, chatId, dto);
  }

  @ApiOperation({ summary: 'Удалить AI-чат' })
  @Delete('chats/:chatId')
  deleteChat(
    @Req() request: AuthRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.aiService.deleteChat(request.user.id, chatId);
  }
}
