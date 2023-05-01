import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatBot } from './dto/create-chatbot.dto';

@Injectable()
export class ChatbotService {
  constructor(private prismaService: PrismaService) {}

  public async createChatBotFromText(createChatBot: CreateChatBot) {
    const { name, description } = createChatBot;
    const findChatbot = await this.prismaService.chatbot.findUnique({
      where: {
        name: createChatBot.name,
      },
    });
    if (findChatbot)
      return new BadRequestException({ message: 'Chatbot name already exist' });

    /**
     * openai api
     */

    const chatbot = await this.prismaService.chatbot.create({
      data: {
        name,
        description,
      },
    });
    return chatbot;
  }
}
