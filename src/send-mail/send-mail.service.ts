import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendMailService {
  constructor(private mailerService: MailerService) {}

  public async forgotPassword({
    email,
    token,
  }: {
    email: string;
    token: string;
  }) {
    return await this.mailerService.sendMail({
      to: email,
      from: 's.ishimwegabin@gmail.com',
      html: `
      <h1>Forgot password</h1>
      <h2>reset token ${token}</h2>
      `,
      subject: 'Change password',
      text: 'Change password',
    });
  }
}
