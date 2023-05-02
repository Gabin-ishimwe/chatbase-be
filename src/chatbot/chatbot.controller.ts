import {
  Body,
  Controller,
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
import { getPDFText } from 'src/helpers/readPdf';
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
        return this.chatbotService.createChatBotFromFiles(file);
      case FetchType.WEBSITE:
        break;
      default:
        throw new Error('Invalid fetchType');
    }
  }

  @Public()
  @Post('send-message')
  public async sendMessage(@Body() sendMessage: SendMessageDto) {
    return this.chatbotService.sendChatMessage(sendMessage);
  }

  @Public()
  @Get()
  public async test() {
    const pdf = await getPDFText(
      'https://res.cloudinary.com/dmepvxtwv/image/upload/v1683028324/sndkzdssdi9xhebvljps.pdf',
      undefined,
    );
    console.log(pdf);
    return pdf;
  }
}
