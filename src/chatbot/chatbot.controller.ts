import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chatbot')
export class ChatbotController {
  @Post('create-bot')
  @UseInterceptors(FileInterceptor('file'))
  public async createChatBot() {
    // file: Express.Multer.File, // ) //   }), //     validators: [new FileTypeValidator({ fileType: '' })], //   new ParseFilePipe({ // @UploadedFile(
    return null;
  }
}
