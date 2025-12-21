import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await this.usersService.create({
        ...createUserDto,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        this.logger.warn(`Failed to send verification email: ${emailError.message}`);
        // Continue registration even if email fails
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
          isEmailVerified: user.isEmailVerified,
          profile: user.profile ? {
            id: user.profile.id,
            avatar: user.profile.avatar,
            bio: user.profile.bio
          } : null
        },
        message: 'Регистрация успешна. Проверьте почту для подтверждения email.'
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Ошибка при регистрации: ' + error.message);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    
    if (!user) {
      throw new BadRequestException('Недействительный токен верификации');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Токен верификации истёк. Запросите новый.');
    }

    await this.usersService.verifyEmail(user.id);

    return { message: 'Email успешно подтверждён' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return { message: 'Если аккаунт существует, письмо будет отправлено' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email уже подтверждён');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersService.updateVerificationToken(user.id, verificationToken, verificationExpires);
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Письмо с подтверждением отправлено' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    // Don't reveal if user exists
    if (!user) {
      return { message: 'Если аккаунт существует, письмо будет отправлено' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.setPasswordResetToken(user.id, resetToken, resetExpires);
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Инструкции по сбросу пароля отправлены на email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Недействительный токен сброса пароля');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Токен сброса пароля истёк. Запросите новый.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.resetPassword(user.id, hashedPassword);

    return { message: 'Пароль успешно изменён' };
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
          isEmailVerified: user.isEmailVerified,
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
