import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Public } from 'src/auth/decorator/isPublic';
import { User } from 'src/auth/decorator/user.decorator';
import { ChatbotService } from './chatbot.service';
import { CreateChatBot, FetchType } from './dto/create-chatbot.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateChatBot } from './dto/update-chatbot.dto';

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

  @Put(':botId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'chatbotProfile', maxCount: 1 },
    ]),
  )
  public async updateBot(
    @Param('botId') chatbotId: string,
    @User('userId') userId: string,
    @Body()
    updateBot: UpdateChatBot,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    upload: {
      file?: Express.Multer.File[];
      chatbotProfile?: Express.Multer.File[];
    },
  ) {
    return await this.chatbotService.updateChatBot(
      chatbotId,
      userId,
      updateBot,
      upload,
    );
  }

  @Get(':botId')
  public async getOneBot(
    @User('userId') userId: string,
    @Param('botId') botId: string,
  ) {
    return await this.chatbotService.oneBot(userId, botId);
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
