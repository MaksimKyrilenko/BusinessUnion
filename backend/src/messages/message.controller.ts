import { Controller, Post, Put, Delete, Param, Request, Body, BadRequestException, InternalServerErrorException, HttpException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from '../chat/message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.messageService.markAsRead(+id, req.user.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async editMessage(
    @Param('id') id: string,
    @Body() body: { text: string },
    @Request() req,
  ) {
    if (!body.text || !body.text.trim()) {
      throw new BadRequestException('Текст сообщения не может быть пустым');
    }
    
    try {
      return await this.messageService.editMessage(+id, req.user.sub, body.text);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при редактировании сообщения');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMessage(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      await this.messageService.deleteMessage(+id, req.user.sub);
      return { success: true, message: 'Сообщение удалено' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении сообщения');
    }
  }
  
  @Post(':id/forward')
  @UseGuards(JwtAuthGuard)
  async forwardMessage(
    @Param('id') id: string,
    @Body() forwardDto: { targetChatId: number },
    @Request() req,
  ) {
    if (!forwardDto.targetChatId) {
      throw new BadRequestException('Необходимо указать ID целевого чата');
    }
    
    const userId = req.user.sub;
    
    try {
      const forwardedMessage = await this.messageService.forwardMessage(
        +id,
        +forwardDto.targetChatId,
        +userId
      );
      
      return forwardedMessage;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при пересылке сообщения');
    }
  }

  @Post(':id/reaction')
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @Param('id') id: string,
    @Body() body: { reaction: string },
    @Request() req,
  ) {
    if (!body.reaction) {
      throw new BadRequestException('Необходимо указать реакцию');
    }
    
    try {
      return await this.messageService.addReaction(+id, req.user.sub, body.reaction);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при добавлении реакции');
    }
  }

  @Delete(':id/reaction/:reaction')
  @UseGuards(JwtAuthGuard)
  async removeReaction(
    @Param('id') id: string,
    @Param('reaction') reaction: string,
    @Request() req,
  ) {
    try {
      return await this.messageService.removeReaction(+id, req.user.sub, decodeURIComponent(reaction));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении реакции');
    }
  }
} 