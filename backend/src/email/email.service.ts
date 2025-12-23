import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('RESEND_API_KEY', '');
    this.senderEmail = this.configService.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev');
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: this.senderEmail,
          to: [to],
          subject,
          html: htmlContent,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      this.logger.log(`Email sent to ${to}, id: ${response.data.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'https://businessunion-web.ru');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const htmlContent = `
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
    `;

    await this.sendEmail(email, 'Подтверждение email - BusinessUnion', htmlContent);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'https://businessunion-web.ru');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const htmlContent = `
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
    `;

    await this.sendEmail(email, 'Восстановление пароля - BusinessUnion', htmlContent);
  }
}
