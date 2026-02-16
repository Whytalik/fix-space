import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(MailService.name);
  }

  async onModuleInit() {
    await this.createTransport();
  }

  private async createTransport() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (!smtpHost) {
      // Development mode: use Ethereal test account
      this.logger.log('No SMTP_HOST configured, creating Ethereal test account');
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(
        `Ethereal test account created: ${testAccount.user} (emails will be captured at https://ethereal.email)`,
      );
    } else {
      // Production mode: use real SMTP credentials
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      this.logger.log(`Mail service initialized with SMTP host: ${smtpHost}`);
    }
  }

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3001',
    );
    const verificationLink = `${appUrl}/auth/verify?token=${token}`;
    const from = this.configService.get<string>(
      'MAIL_FROM',
      'noreply@nucleus.app',
    );

    const mailOptions = {
      from,
      to,
      subject: 'Verify your Nucleus account',
      text: `Hello ${username},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create this account, you can safely ignore this email.\n\nBest regards,\nThe Nucleus Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Verify Your Email Address</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thank you for registering with Nucleus! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #7f8c8d;">This link will expire in 24 hours.</p>
            <p style="font-size: 14px; color: #7f8c8d;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #7f8c8d;">${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #95a5a6;">If you did not create this account, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    this.logger.log(`Verification email sent to ${to}`);

    // In development with Ethereal, log the preview URL
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    if (!smtpHost) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      this.logger.log(
        `📧 Ethereal email preview: ${previewUrl || 'Preview URL not available'}`,
      );
    }
  }
}
