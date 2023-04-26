import { Module } from '@nestjs/common';
import { SendMailService } from './send-mail.service';

@Module({
  providers: [SendMailService],
  exports: [SendMailService],
})
export class SendMailModule {}
