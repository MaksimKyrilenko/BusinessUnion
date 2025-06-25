import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
    console.log('JwtStrategy инициализирован');
  }

  async validate(payload: any) {
    // Добавляем диагностическое логирование
    console.log('JWT токен валидация:', {
      payload: payload ? {
        sub: payload.sub,
        email: payload.email,
        userType: payload.userType,
        iat: payload.iat,
        exp: payload.exp
      } : 'Отсутствует'
    });

    if (!payload) {
      console.error('JWT валидация: Payload отсутствует');
      throw new UnauthorizedException('Невалидный токен');
    }

    if (!payload.sub || !payload.email || !payload.userType) {
      console.error('JWT валидация: Отсутствуют необходимые поля в payload', {
        sub: payload.sub || 'Отсутствует',
        email: payload.email || 'Отсутствует',
        userType: payload.userType || 'Отсутствует'
      });
      throw new UnauthorizedException('Неверные данные токена');
    }

    // Проверяем корректность ID пользователя (должен быть числом)
    let userId: number;
    try {
      const idString = String(payload.sub).trim();
      const parsedId = parseInt(idString, 10);
      
      if (isNaN(parsedId)) {
        console.error(`JWT валидация: ID пользователя (${payload.sub}) не является числом!`);
        throw new UnauthorizedException('Некорректный ID пользователя в токене');
      }
      
      userId = parsedId;
      console.log(`JWT валидация: ID пользователя корректно преобразован в число: ${userId}`);
    } catch (error) {
      console.error('JWT валидация: Ошибка при обработке ID пользователя:', error);
      throw new UnauthorizedException('Ошибка при обработке ID пользователя');
    }

    // Формирование данных пользователя для req.user
    const user = {
      sub: userId, // Теперь используем преобразованный числовой ID
      email: payload.email,
      userType: payload.userType,
    };

    console.log('JWT валидация успешна, данные пользователя:', user);
    return user;
  }
} 