import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      const user = await this.usersService.create(createUserDto);
      const token = this.generateToken(user);
      
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          profile: user.profile ? {
            id: user.profile.id,
            avatar: user.profile.avatar,
            bio: user.profile.bio
          } : null
        }
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Ошибка при регистрации: ' + error.message);
    }
  }

  async login(email: string, password: string, userType?: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      if (userType && user.userType !== userType) {
        console.warn(`Тип пользователя в запросе (${userType}) не соответствует типу в базе (${user.userType})`);
      }

      const token = this.generateToken(user);
      
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          profile: user.profile ? {
            id: user.profile.id,
            avatar: user.profile.avatar,
            bio: user.profile.bio
          } : null
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Ошибка при входе: ' + error.message);
    }
  }

  private generateToken(user: any) {
    if (!user || !user.id) {
      console.error('Ошибка при генерации токена: пользователь или ID отсутствуют', user);
      throw new Error('Неверные данные пользователя для токена');
    }
    
    let userId;
    try {
      userId = Number(user.id);
      if (isNaN(userId)) {
        console.error(`Ошибка: ID пользователя "${user.id}" не может быть преобразован в число`);
        throw new Error('Некорректный ID пользователя');
      }
    } catch (error) {
      console.error('Ошибка при обработке ID пользователя:', error);
      throw new Error('Ошибка при обработке ID пользователя');
    }
    
    const payload = { 
      email: user.email, 
      sub: userId,
      userType: user.userType
    };
    
    console.log('Генерация JWT токена для пользователя:', {
      userId: userId,
      email: user.email,
      userType: user.userType
    });
    
    return this.jwtService.sign(payload);
  }

  async validateUser(loginUserDto: LoginUserDto) {
    try {
      const user = await this.usersService.findByEmail(loginUserDto.email);
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      if (loginUserDto.userType && user.userType !== loginUserDto.userType) {
        console.warn(`Тип пользователя в запросе (${loginUserDto.userType}) не соответствует типу в базе (${user.userType})`);
      }
      
      return user;
    } catch (error) {
      throw new Error('Ошибка при валидации пользователя: ' + error.message);
    }
  }
} 