import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { uploadImage } from 'src/helper/upload';
import { textBot } from 'src/helpers/prompts/textBot';
import { getPDFText } from 'src/helpers/readPdf';
import { getScrapeData } from 'src/helpers/scrapeData';
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
      return { message: 'Chatbot created', data: chatbot };
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
  public async createChatBotFromFiles(
    userId: string,
    file: Express.Multer.File,
  ) {
    try {
      const pdf = await getPDFText(file.path, undefined);
      const uploadFile = await uploadImage(file);
      /**
       * openai api
       * use description a prompt to the ai to generate structure content
       * create handler to read file content
       */
      const createBot = await this.prismaService.chatbot.create({
        data: {
          fileUploads: uploadFile.secure_url,
          description: pdf,
          userId,
        },
      });
      return { message: 'Chatbot created', data: createBot };
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create chatbot from web scrapped data
   * @param createChatBot
   */
  public async createChatBotFromWebScraping(
    userId: string,
    createChatBot: CreateChatBot,
  ) {
    try {
      const { fetchSites } = createChatBot;
      let rawData = '';
      for (const url in fetchSites) {
        const res = await getScrapeData(url);
        rawData += res;
      }
      // console.log(rawData);
      // return true;
      const chatbot = await this.prismaService.chatbot.create({
        data: {
          description: rawData,
          userId: userId,
        },
      });
      return { message: 'Chatbot created', data: chatbot };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      /**
       * compute previous prompts
       */
      const res = chat.data.choices[0].text.slice(3);
      const newPrompt = this.computeNewPrompt(
        res,
        message,
        JSON.stringify(findChatbot.description),
      );

      type FormatMessage = {
        role: string;
        message: string;
      };

      const formatMessage: FormatMessage = { role: 'USER', message: message };
      const formatAiMessage: FormatMessage = {
        role: 'ASSISTANT',
        message: res,
      };
      await this.prismaService.chatbot.update({
        where: {
          id: findChatbot.id,
        },
        data: {
          messages: [...findChatbot.messages, formatAiMessage, formatMessage],
          description: newPrompt,
        },
      });
      return { response: res };
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  public computeNewPrompt(
    res: string,
    message: string,
    description: string,
  ): string {
    return `
    ${description}
    Question: ${message}
    Answer: ${res}
    `;
  }

  public async deleteAllBot() {
    return await this.prismaService.chatbot.deleteMany();
  }

  public async getUserBots(userId: string) {
    try {
      const data = await this.prismaService.chatbot.findMany({
        where: {
          userId,
        },
        include: {
          user: true,
        },
      });
      return { message: 'All chatbots', data };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async oneBot(userId: string, botId: string) {
    try {
      const findBot = await this.prismaService.chatbot.findFirst({
        where: {
          userId,
          id: botId,
        },
      });
      if (!findBot) return new NotFoundException("Chatbot doesn't exist");
      return {
        message: 'User bot',
        data: findBot,
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
