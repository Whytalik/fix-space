import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { AppLogger } from "../common/logger/app-logger.service";

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter;

  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(MailService.name);
  }

  async onModuleInit() {
    await this.createTransport();
  }

  private async createTransport() {
    const smtpHost = this.configService.get<string>("SMTP_HOST");

    if (!smtpHost) {
      // Development mode: use Ethereal test account
      this.logger.log("No SMTP_HOST configured, creating Ethereal test account");
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
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
        port: this.configService.get<number>("SMTP_PORT", 587),
        secure: this.configService.get<number>("SMTP_PORT", 587) === 465,
        auth: {
          user: this.configService.get<string>("SMTP_USER"),
          pass: this.configService.get<string>("SMTP_PASS"),
        },
      });

      this.logger.log(`Mail service initialized with SMTP host: ${smtpHost}`);
    }
  }

  async sendVerificationEmail(to: string, username: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    const verificationLink = `${appUrl}/auth/verify?token=${token}`;
    const from = this.configService.get<string>("MAIL_FROM", "noreply@nucleus.app");

    const mailOptions = {
      from,
      to,
      subject: "Verify your Nucleus account",
      text: `Hello ${username},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create this account, you can safely ignore this email.\n\nBest regards,\nThe Nucleus Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Nucleus account</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f11;">
            <tr>
              <td align="center" style="padding:48px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom:28px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding-right:10px;vertical-align:middle;">
                            <svg width="32" height="32" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stop-color="#5865f2"/>
                                  <stop offset="100%" stop-color="#7b5cf0"/>
                                </linearGradient>
                                <linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stop-color="#4752c4"/>
                                  <stop offset="100%" stop-color="#2d1a8a"/>
                                </linearGradient>
                                <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stop-color="#7b5cf0"/>
                                  <stop offset="100%" stop-color="#a855f7"/>
                                </linearGradient>
                              </defs>
                              <g opacity=".35" transform="translate(0,10)">
                                <polygon points="30,8 52,20 30,32 8,20" fill="url(#a)"/>
                                <polygon points="8,20 30,32 30,44 8,32" fill="url(#b)"/>
                                <polygon points="52,20 30,32 30,44 52,32" fill="url(#c)"/>
                              </g>
                              <g opacity=".6" transform="translate(0,3)">
                                <polygon points="30,8 52,20 30,32 8,20" fill="url(#a)"/>
                                <polygon points="8,20 30,32 30,44 8,32" fill="url(#b)"/>
                                <polygon points="52,20 30,32 30,44 52,32" fill="url(#c)"/>
                              </g>
                              <polygon points="30,8 52,20 30,32 8,20" fill="url(#a)"/>
                              <polygon points="8,20 30,32 30,44 8,32" fill="url(#b)"/>
                              <polygon points="52,20 30,32 30,44 52,32" fill="url(#c)"/>
                            </svg>
                          </td>
                          <td style="vertical-align:middle;">
                            <span style="font-size:17px;font-weight:800;color:#e8e8f0;letter-spacing:-0.04em;line-height:1;">Nucleus</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Card -->
                  <tr>
                    <td style="background-color:#18181d;border:1px solid #2a2a35;border-radius:12px;padding:0;overflow:hidden;">

                      <!-- Accent bar -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="height:3px;background-color:#5865f2;border-radius:12px 12px 0 0;"></td>
                        </tr>
                      </table>

                      <!-- Card body -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:36px 40px 40px;">

                            <h1 style="margin:0 0 6px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;line-height:1.2;">Verify your email address</h1>
                            <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.6;">Confirm your identity to activate your account.</p>

                            <p style="margin:0 0 16px 0;font-size:15px;color:#e8e8f0;line-height:1.7;">Hey <strong>${username}</strong>,</p>
                            <p style="margin:0 0 28px 0;font-size:15px;color:#888888;line-height:1.7;">
                              Welcome to Nucleus! Click the button below to verify your email address. This link will expire in <strong style="color:#e8e8f0;">24 hours</strong>.
                            </p>

                            <!-- CTA button -->
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                              <tr>
                                <td style="border-radius:8px;background-color:#5865f2;">
                                  <a href="${verificationLink}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;border-radius:8px;">
                                    Verify Email Address
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <!-- Divider -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                              <tr><td style="height:1px;background-color:#2a2a35;"></td></tr>
                            </table>

                            <!-- Fallback link -->
                            <p style="margin:0 0 6px 0;font-size:12px;color:#888888;line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="margin:0;font-size:11px;color:#5865f2;word-break:break-all;line-height:1.6;">${verificationLink}</p>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top:24px;">
                      <p style="margin:0;font-size:12px;color:#444444;line-height:1.6;">
                        If you didn't create a Nucleus account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    this.logger.log(`Verification email sent to ${to}`);

    // In development with Ethereal, log the preview URL
    const smtpHost = this.configService.get<string>("SMTP_HOST");
    if (!smtpHost) {
      const previewUrl = nodemailer.getTestMessageUrl(info as Parameters<typeof nodemailer.getTestMessageUrl>[0]);
      this.logger.log(`📧 Ethereal email preview: ${previewUrl || "Preview URL not available"}`);
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    const from = this.configService.get<string>("MAIL_FROM", "noreply@nucleus.app");

    const info = await this.transporter.sendMail({
      from,
      to,
      subject: "Reset your Nucleus password",
      text: `You requested a password reset.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.`,
      html: `
        <body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f11;">
            <tr><td align="center" style="padding:48px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
                <tr><td style="background-color:#18181d;border:1px solid #2a2a35;border-radius:12px;padding:36px 40px;">
                  <h1 style="margin:0 0 8px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;">Reset your password</h1>
                  <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.7;">Click the button below to set a new password. This link expires in <strong style="color:#e8e8f0;">1 hour</strong>.</p>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                    <tr><td style="border-radius:8px;background-color:#5865f2;">
                      <a href="${resetLink}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Reset Password</a>
                    </td></tr>
                  </table>
                  <p style="margin:0;font-size:12px;color:#888888;">If you didn't request this, you can safely ignore this email.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>`,
    });

    this.logger.log(`Password reset email sent to ${to}`);

    const smtpHost = this.configService.get<string>("SMTP_HOST");
    if (!smtpHost) {
      const previewUrl = nodemailer.getTestMessageUrl(info as Parameters<typeof nodemailer.getTestMessageUrl>[0]);
      this.logger.log(`📧 Ethereal email preview: ${previewUrl || "Preview URL not available"}`);
    }
  }
}
