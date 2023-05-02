import {
  Body,
  Controller,
  FileTypeValidator,
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
  @UseInterceptors(FileInterceptor('file'))
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
    let response;
    switch (createChatBot.fetchType) {
      case FetchType.TEXT:
        response = this.chatbotService.createChatBotFromText(
          userId,
          createChatBot,
        );
        break;
      case FetchType.FILE:
        response = this.chatbotService.createChatBotFromFiles(file);
        break;
      case FetchType.WEBSITE:
        break;

      default:
        return null;
    }

    return response;
  }

  @Public()
  @Post('send-message')
  public async sendMessage(@Body() sendMessage: SendMessageDto) {
    return this.chatbotService.sendChatMessage(sendMessage);
  }
}
