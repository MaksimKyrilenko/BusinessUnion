import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async handleVKLogin(userData: any) {
    try {
      // Создаем объект пользователя из данных VK
      const user = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        photo: userData.photo_200,
        email: userData.email
      };

      // Генерируем JWT
      const token = this.generateJwtToken(user);
      
      return { token, user };
    } catch (error) {
      console.error('VK Login Error:', error);
      throw error;
    }
  }

  async handleVKCallback(code: string) {
    try {
      // Получаем access token
      const tokenResponse = await axios.get('https://id.vk.com/token', {
        params: {
          app_id: process.env.VK_CLIENT_ID,
          app_secret: process.env.VK_CLIENT_SECRET,
          redirect_uri: process.env.VK_REDIRECT_URI,
          code: code
        }
      });

      const { access_token, user_id } = tokenResponse.data;

      // Получаем информацию о пользователе
      const userResponse = await axios.get('https://api.vk.com/method/users.get', {
        params: {
          user_ids: user_id,
          fields: 'photo_200',
          access_token: access_token,
          v: '5.131'
        }
      });

      const userData = userResponse.data.response[0];

      // Создаем JWT токен
      const payload = {
        sub: `vk_${user_id}`,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatar: userData.photo_200
      };

      return this.jwtService.sign(payload);
    } catch (error) {
      console.error('VK token error:', error);
      throw error;
    }
  }

  private generateJwtToken(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email 
    };
    return this.jwtService.sign(payload);
  }

  async handleVKWidgetAuth(uid: string, hash: string) {
    try {
      // Проверяем подпись
      const secretKey = process.env.VK_CLIENT_SECRET;
      const check = crypto
        .createHash('md5')
        .update(`${process.env.VK_CLIENT_ID}_${uid}_${secretKey}`)
        .digest('hex');

      if (check !== hash) {
        throw new Error('Invalid hash');
      }

      // Получаем информацию о пользователе через API
      const userResponse = await axios.get('https://api.vk.com/method/users.get', {
        params: {
          user_ids: uid,
          fields: 'photo_200',
          access_token: process.env.VK_SERVICE_KEY,
          v: '5.131'
        }
      });

      const userData = userResponse.data.response[0];

      // Создаем JWT токен
      const payload = {
        sub: `vk_${uid}`,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatar: userData.photo_200
      };

      return this.jwtService.sign(payload);
    } catch (error) {
      console.error('VK widget auth error:', error);
      throw error;
    }
  }
} 