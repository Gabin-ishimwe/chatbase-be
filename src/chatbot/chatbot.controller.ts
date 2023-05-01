import { Controller, ParseFilePipe, Post, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatbotService } from './chatbot.service';
import { CreateChatBot, FetchType } from './dto/create-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}
  @Post('create-bot')
  @UseInterceptors(FileInterceptor('file'))
  public async createChatBot(
    @UploadedFile(new ParseFilePipe({ validators: [] }))
    file: Express.Multer.File,
    createChatBot: CreateChatBot,
  ) {
    switch (createChatBot.fetchSites) {
      case FetchType.TEXT:
        this.chatbotService.createChatBotFromText(createChatBot);
        break;
      case FetchType.FILE:
        break;
      case FetchType.WEBSITE:
        break;

      default:
        return null;
    }
  }
}
