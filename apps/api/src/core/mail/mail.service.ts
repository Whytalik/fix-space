import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { Resend } from "resend";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;

  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(MailService.name);
  }

  async onModuleInit() {
    await this.initializeService();
  }

  private async initializeService() {
    const resendKey = this.configService.get<string>("RESEND_API_KEY");
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";

    if (isProduction && resendKey) {
      this.resend = new Resend(resendKey);
      this.logger.log("Mail service initialized with Resend SDK");
      return;
    }

    const smtpHost = this.configService.get<string>("SMTP_HOST");

    if (!smtpHost) {
      this.logger.log("No SMTP_HOST or RESEND_API_KEY configured, creating Ethereal test account");
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

      this.logger.log(`Ethereal test account created: ${testAccount.user} (emails will be captured at https://ethereal.email)`);
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>("SMTP_PORT", 587),
        secure: this.configService.get<number>("SMTP_PORT", 587) === 465,
        auth: {
          user: this.configService.get<string>("SMTP_USER"),
          pass: this.configService.get<string>("SMTP_PASS"),
        },
      });

      try {
        await this.transporter.verify();
        this.logger.log(`Mail service successfully connected to SMTP host: ${smtpHost}`);
      } catch (error) {
        this.logger.error(`Mail service failed to connect to SMTP host: ${smtpHost}`, {
          error: (error as Error).message,
          code: (error as any).code,
        });
      }
    }
  }

  async sendVerificationEmail(to: string, username: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    const verificationLink = `${appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
    const from = this.configService.get<string>("MAIL_FROM", "noreply@fixspace.app");

    const subject = t("emails.verification.subject");
    const text = t("emails.verification.body", { link: verificationLink });
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t("emails.verification.htmlTitle")}</title>
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
                            <span style="font-size:17px;font-weight:800;color:#e8e8f0;letter-spacing:-0.04em;line-height:1;">FIX Space</span>
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

                            <h1 style="margin:0 0 6px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;line-height:1.2;">${t("emails.verification.htmlTitle")}</h1>
                            <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.6;">${t("emails.verification.htmlSubtitle")}</p>

                            <p style="margin:0 0 16px 0;font-size:15px;color:#e8e8f0;line-height:1.7;">${t("emails.verification.greeting")} <strong>${escapeHtml(username)}</strong>,</p>
                            <p style="margin:0 0 28px 0;font-size:15px;color:#888888;line-height:1.7;">
                              ${t("emails.verification.htmlWelcome")} ${t("emails.verification.htmlExpiry")}
                            </p>

                            <!-- CTA button -->
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                              <tr>
                                <td style="border-radius:8px;background-color:#5865f2;">
                                  <a href="${verificationLink}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;border-radius:8px;">
                                    ${t("emails.verification.htmlButton")}
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <!-- Divider -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                              <tr><td style="height:1px;background-color:#2a2a35;"></td></tr>
                            </table>

                            <!-- Fallback link -->
                            <p style="margin:0 0 6px 0;font-size:12px;color:#888888;line-height:1.5;">${t("emails.verification.htmlFallback")}</p>
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
                        ${t("emails.verification.htmlIgnore")}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

    if (this.resend) {
      const { error } = await this.resend.emails.send({ from, to, subject, html, text });
      if (error) {
        this.logger.error(`Resend failed to send verification email to ${to}`, { error: error.message });
      } else {
        this.logger.log(`Verification email sent to ${to} via Resend`);
      }
      return;
    }

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({ from, to, subject, html, text });
        this.logger.log(`Verification email sent to ${to} via SMTP`);

        if (!this.configService.get("SMTP_HOST")) {
          const previewUrl = nodemailer.getTestMessageUrl(info as SMTPTransport.SentMessageInfo);
          this.logger.log(`Ethereal email preview: ${previewUrl || "Preview URL not available"}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${to} via SMTP`, { error: (error as Error).message });
      }
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const from = this.configService.get<string>("MAIL_FROM", "noreply@fixspace.app");

    const subject = t("emails.passwordReset.subject");
    const text = t("emails.passwordReset.body", { link: resetLink });
    const html = `
          <body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f11;">
              <tr><td align="center" style="padding:48px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
                  <tr><td style="background-color:#18181d;border:1px solid #2a2a35;border-radius:12px;padding:36px 40px;">
                    <h1 style="margin:0 0 8px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;">${t("emails.passwordReset.htmlTitle")}</h1>
                    <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.7;">${t("emails.passwordReset.htmlSubtitle")}</p>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                      <tr><td style="border-radius:8px;background-color:#5865f2;">
                        <a href="${resetLink}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${t("emails.passwordReset.htmlButton")}</a>
                      </td></tr>
                    </table>
                    <p style="margin:0;font-size:12px;color:#888888;">${t("emails.passwordReset.htmlIgnore")}</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>`;

    if (this.resend) {
      const { error } = await this.resend.emails.send({ from, to, subject, html, text });
      if (error) {
        this.logger.error(`Resend failed to send password reset email to ${to}`, { error: error.message });
      } else {
        this.logger.log(`Password reset email sent to ${to} via Resend`);
      }
      return;
    }

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({ from, to, subject, html, text });
        this.logger.log(`Password reset email sent to ${to} via SMTP`);

        if (!this.configService.get("SMTP_HOST")) {
          const previewUrl = nodemailer.getTestMessageUrl(info as SMTPTransport.SentMessageInfo);
          this.logger.log(`Ethereal email preview: ${previewUrl || "Preview URL not available"}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${to} via SMTP`, { error: (error as Error).message });
      }
    }
  }

  async sendPasswordChangeNotification(to: string): Promise<void> {
    const from = this.configService.get<string>("MAIL_FROM", "noreply@fixspace.app");
    const subject = t("emails.passwordChanged.subject");
    const text = t("emails.passwordChanged.body");
    const html = `
          <body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f11;">
              <tr><td align="center" style="padding:48px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
                  <tr><td style="background-color:#18181d;border:1px solid #2a2a35;border-radius:12px;padding:36px 40px;">
                    <h1 style="margin:0 0 8px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;">${t("emails.passwordChanged.htmlTitle")}</h1>
                    <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.7;">${t("emails.passwordChanged.htmlSubtitle")}</p>
                    <p style="margin:0;font-size:12px;color:#888888;">${t("emails.passwordChanged.htmlIgnore")}</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>`;

    if (this.resend) {
      const { error } = await this.resend.emails.send({ from, to, subject, html, text });
      if (error) {
        this.logger.error(`Resend failed to send password change notification to ${to}`, { error: error.message });
      } else {
        this.logger.log(`Password change notification sent to ${to} via Resend`);
      }
      return;
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html, text });
        this.logger.log(`Password change notification sent to ${to} via SMTP`);
      } catch (error) {
        this.logger.error(`Failed to send password change notification to ${to} via SMTP`, {
          error: (error as Error).message,
        });
      }
    }
  }

  async sendAccountDeletionNotification(to: string): Promise<void> {
    const from = this.configService.get<string>("MAIL_FROM", "noreply@fixspace.app");
    const subject = t("emails.accountDeleted.subject");
    const text = t("emails.accountDeleted.body");
    const html = `
          <body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f11;">
              <tr><td align="center" style="padding:48px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
                  <tr><td style="background-color:#18181d;border:1px solid #2a2a35;border-radius:12px;padding:36px 40px;">
                    <h1 style="margin:0 0 8px 0;font-size:21px;font-weight:700;color:#e8e8f0;letter-spacing:-0.02em;">${t("emails.accountDeleted.htmlTitle")}</h1>
                    <p style="margin:0 0 28px 0;font-size:14px;color:#888888;line-height:1.7;">${t("emails.accountDeleted.htmlSubtitle")}</p>
                    <p style="margin:0;font-size:12px;color:#888888;">${t("emails.accountDeleted.htmlIgnore")}</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>`;

    if (this.resend) {
      const { error } = await this.resend.emails.send({ from, to, subject, html, text });
      if (error) {
        this.logger.error(`Resend failed to send account deletion notification to ${to}`, { error: error.message });
      } else {
        this.logger.log(`Account deletion notification sent to ${to} via Resend`);
      }
      return;
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html, text });
        this.logger.log(`Account deletion notification sent to ${to} via SMTP`);
      } catch (error) {
        this.logger.error(`Failed to send account deletion notification to ${to} via SMTP`, {
          error: (error as Error).message,
        });
      }
    }
  }
}
