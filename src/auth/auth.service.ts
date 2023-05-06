import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { nanoid } from 'nanoid';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMailService } from 'src/send-mail/send-mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private sendMail: SendMailService,
  ) {}

  public async signUpUser(signUpDto: SignUpDto) {
    try {
      const { firstName, lastName, email, password } = signUpDto;
      const findUser = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (findUser)
        return new NotFoundException('User arleady have an account');

      // hash password
      // save user in db
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prismaService.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      const jwtPayload = { userId: user.id, email: user.email };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return {
        message: 'User successfully registered',
        accessToken,
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      const findUser = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!findUser)
        return new NotFoundException("User doesn't exist, signup an account");

      const compare = await bcrypt.compare(password, findUser.password);
      if (!compare)
        return new BadRequestException({
          message: 'Invalid credentials',
        });
      const jwtPayload = { userId: findUser.id, email: findUser.email };
      const accessToken = await this.jwtService.signAsync(jwtPayload);
      await this.prismaService.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          refreshToken: accessToken,
        },
      });
      return {
        message: 'User logged in successfully',
        accessToken,
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async forgotPassword(forgotPassword: ForgotPasswordDto) {
    try {
      // send email
      const findUser = await this.prismaService.user.findUnique({
        where: { email: forgotPassword.email },
      });
      if (!findUser)
        return new NotFoundException("User doesn't exist, signup an account");

      // generate reset token
      const resetToken = await this.getResetToken(findUser.id);

      await this.sendMail.forgotPassword({
        userId: findUser.id,
        email: forgotPassword.email,
        token: resetToken.token,
      });
      return {
        message: 'Email sent to your inbox',
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getResetToken(userId: string) {
    const findToken = await this.prismaService.resetToken.findUnique({
      where: {
        userId,
      },
    });
    if (findToken) {
      // delete token
      await this.prismaService.resetToken.delete({
        where: {
          userId,
        },
      });
    }
    const newToken: string = nanoid();
    return await this.prismaService.resetToken.create({
      data: {
        userId,
        token: newToken,
      },
    });
  }

  public async changePassword(changePassword: ChangePasswordDto) {
    try {
      const verifyResetPassword = await this.prismaService.resetToken.findFirst(
        {
          where: {
            userId: changePassword.userId,
            token: changePassword.token,
          },
        },
      );
      if (!verifyResetPassword)
        return new ForbiddenException({
          message: 'Invalid or expired password reset token',
        });

      const hashedPassword = await bcrypt.hash(changePassword.newPassword, 10);

      await this.prismaService.user.update({
        where: {
          id: changePassword.userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      await this.prismaService.resetToken.delete({
        where: {
          userId: changePassword.userId,
        },
      });
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async logout(userId: string) {
    try {
      const findUser = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!findUser)
        return new NotFoundException({ message: "User account doesn't exist" });
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteAllUsers() {
    return await this.prismaService.user.deleteMany();
  }
}
