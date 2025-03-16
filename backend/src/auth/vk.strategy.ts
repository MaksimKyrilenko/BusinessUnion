import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-vkontakte';

@Injectable()
export class VKStrategy extends PassportStrategy(Strategy, 'vk') {
  constructor() {
    if (!process.env.VK_CLIENT_ID || !process.env.VK_CLIENT_SECRET) {
      throw new Error('VK_CLIENT_ID и VK_CLIENT_SECRET должны быть определены в переменных окружения');
    }

    super({
      clientID: process.env.VK_CLIENT_ID as string,
      clientSecret: process.env.VK_CLIENT_SECRET as string,
      callbackURL: process.env.VK_CALLBACK_URL || 'http://localhost:8080/auth/vk/callback',
      apiVersion: '5.131',
      profileFields: ['email'],
    } as StrategyOptions);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      vkId: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
    };
    done(null, user);
  }
} 