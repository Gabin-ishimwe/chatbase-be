import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorator/isPublic';
import { User } from 'src/auth/decorator/user.decorator';
import { ChatbotService } from './chatbot.service';
import { CreateChatBot, FetchType } from './dto/create-chatbot.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller({
  path: '/chatbot',
  version: '1',
})
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}
  @Post('create-bot')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  public async createChatBot(
    @User('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
    @Body() createChatBot: CreateChatBot,
  ) {
    const { fetchType } = createChatBot;
    switch (fetchType) {
      case FetchType.TEXT:
        return this.chatbotService.createChatBotFromText(userId, createChatBot);
      case FetchType.FILE:
        return this.chatbotService.createChatBotFromFiles(userId, file);
      case FetchType.WEBSITE:
        return this.chatbotService.createChatBotFromWebScraping(
          userId,
          createChatBot,
        );
      default:
        throw new Error('Invalid fetchType');
    }
  }

  @Get()
  public async getUserBots(@User('userId') userId: string) {
    return await this.chatbotService.getUserBots(userId);
  }

  @Public()
  @Post('send-message')
  public async sendMessage(@Body() sendMessage: SendMessageDto) {
    return this.chatbotService.sendChatMessage(sendMessage);
  }

  @Public()
  @Delete()
  public async deleteAll() {
    return await this.chatbotService.deleteAllBot();
  }
}
