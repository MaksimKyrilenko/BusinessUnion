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

    // Формирование данных пользователя для req.user
    const user = {
      sub: payload.sub,
      email: payload.email,
      userType: payload.userType,
    };

    console.log('JWT валидация успешна, данные пользователя:', user);
    return user;
  }
} 