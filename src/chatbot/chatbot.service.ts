import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(private prismaService: PrismaService) {}

  public async createChatBot() {
    return null;
  }
}
