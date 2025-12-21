import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const secure = this.configService.get('SMTP_SECURE', 'false') === 'true';
    const port = parseInt(this.configService.get('SMTP_PORT', '587'));
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.yandex.com'),
      port: port,
      secure: secure, // true для 465, false для 587
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:8081');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', '"BusinessUnion" <noreply@businessunion.ru>'),
        to: email,
        subject: 'Подтверждение email - BusinessUnion',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Добро пожаловать в BusinessUnion!</h2>
            <p>Для завершения регистрации подтвердите ваш email, нажав на кнопку ниже:</p>
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #1976d2; 
                      color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Подтвердить email
            </a>
            <p style="color: #666; font-size: 14px;">
              Если кнопка не работает, скопируйте эту ссылку в браузер:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
              Ссылка действительна 24 часа. Если вы не регистрировались на BusinessUnion, проигнорируйте это письмо.
            </p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:8081');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', '"BusinessUnion" <noreply@businessunion.ru>'),
        to: email,
        subject: 'Восстановление пароля - BusinessUnion',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Восстановление пароля</h2>
            <p>Вы запросили сброс пароля для вашего аккаунта BusinessUnion.</p>
            <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #1976d2; 
                      color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Сбросить пароль
            </a>
            <p style="color: #666; font-size: 14px;">
              Если кнопка не работает, скопируйте эту ссылку в браузер:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
              Ссылка действительна 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            </p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }
}
