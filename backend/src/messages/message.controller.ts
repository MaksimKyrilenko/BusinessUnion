import { Controller, Post, Param, Request, Body, BadRequestException, InternalServerErrorException, HttpException, UseGuards } from '@nestjs/common';
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
} 