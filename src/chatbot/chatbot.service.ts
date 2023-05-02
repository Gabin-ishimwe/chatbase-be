import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { uploadImage } from 'src/helper/upload';
import { textBot } from 'src/helpers/prompts/textBot';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatBot } from './dto/create-chatbot.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatbotService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Create chatbot from the text information
   * @param createChatBot
   * @returns
   */
  public async createChatBotFromText(
    userId: string,
    createChatBot: CreateChatBot,
  ) {
    try {
      const { name, description } = createChatBot;
      const findChatbot = await this.prismaService.chatbot.findUnique({
        where: {
          name: createChatBot.name,
        },
      });
      if (findChatbot)
        return new BadRequestException('Chatbot name already exist');

      /**
       * openai api
       * use description a prompt to the ai to generate structure content
       */
      const chatbot = await this.prismaService.chatbot.create({
        data: {
          name,
          description,
          userId,
        },
      });
      return chatbot;
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create chatbot from information of pdf files
   * @param createChatBot
   * @param file
   * @returns
   */
  public async createChatBotFromFiles(file: Express.Multer.File) {
    try {
      const uploadFile = await uploadImage(file);
      /**
       * openai api
       * use description a prompt to the ai to generate structure content
       * create handler to read file content
       */
      const createBot = await this.prismaService.chatbot.create({
        data: {
          fileUploads: uploadFile.secure_url,
          userId: '64491bcddc0d412462b3fe6d',
        },
      });
      return createBot;
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create chatbot from web scrapped data
   * @param createChatBot
   */
  public async createChatBotFromWebScraping(createChatBot: CreateChatBot) {}

  public async sendChatMessage(sendMessage: SendMessageDto) {
    try {
      /**
       * call chatGPT api
       * get previous system prompts
       *
       */
      const { message, chatbotId } = sendMessage;
      const findChatbot = await this.prismaService.chatbot.findUnique({
        where: {
          id: chatbotId,
        },
      });

      if (!findChatbot) return new NotFoundException('Chatbot not found');
      const chat = await textBot(message, findChatbot.description);
      return { response: chat.data.choices[0].text };
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
