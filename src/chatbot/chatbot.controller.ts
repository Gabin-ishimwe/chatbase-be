import { Controller, ParseFilePipe, Post, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chatbot')
export class ChatbotController {

    @Post('create-bot')
    @UseInterceptors(FileInterceptor('file'))
    public async createChatBot(@UploadedFile(new ParseFilePipe({validators: []})) file: Express.Multer.File)
}
