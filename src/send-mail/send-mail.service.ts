import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendMailService {
  constructor(private mailerService: MailerService) {}

  public async forgotPassword({
    userId,
    email,
    token,
  }: {
    userId: string;
    email: string;
    token: string;
  }) {
    return await this.mailerService.sendMail({
      to: email,
      from: 's.ishimwegabin@gmail.com',
      html: `
      <h1>Forgot password</h1>
      <h2>Click this link to reset your password: <a href="https://griff.vercel.app/reset-password?userId=${userId}&token=${token}">Reset Link</a></h2>
      `,
      subject: 'Change password',
      text: 'Change password',
    });
  }
}
