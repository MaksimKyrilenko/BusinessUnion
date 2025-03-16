import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('vk')
  async vkAuth(@Res() res: Response) {
    const authUrl = `https://id.vk.com/auth?` +
      `app_id=${process.env.VK_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.VK_REDIRECT_URI)}&` +
      `response_type=code&` +
      `v=5.131`;
    
    return res.redirect(authUrl);
  }

  @Get('vk/callback')
  async vkAuthCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response
  ) {
    if (error) {
      console.error('VK auth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
    }

    try {
      const token = await this.authService.handleVKCallback(code);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('VK auth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
} 