import { Controller, Get, Post, Body, Param, UnauthorizedException, HttpException, HttpStatus, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
      if (user) {
        const token = await this.usersService.generateJwt(user);
        return { 
          message: 'Вход выполнен успешно', 
          access_token: token.access_token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            profile: user.profile
          }
        };
      } else {
        throw new UnauthorizedException('Неверный email или пароль');
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка при входе',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      console.log('Данные запроса на получение профиля:', {
        userId: req.user?.sub,
        userObj: req.user,
        authHeader: req.headers?.authorization ? 'Присутствует' : 'Отсутствует'
      });
      
      const userId = req.user?.sub;
      if (!userId) {
        console.error('ID пользователя не найден в JWT токене');
        throw new UnauthorizedException('Токен не содержит ID пользователя');
      }
      
      const user = await this.usersService.findOne(userId);
      if (!user) {
        console.error(`Пользователь с ID ${userId} не найден в базе данных`);
        throw new UnauthorizedException('Пользователь не найден');
      }
      
      console.log(`Получен запрос профиля для пользователя ID: ${userId}`);
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profile: user.profile
      };
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      throw new HttpException(
        error.message || 'Ошибка при получении профиля',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    try {
      const userId = req.user.sub;
      console.log(`Запрос на создание профиля для пользователя ID: ${userId}`);
      
      // Проверим, есть ли уже профиль у пользователя
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }
      
      if (user.profile) {
        console.log(`Профиль уже существует для пользователя ID: ${userId}`);
        // Если профиль уже существует, возвращаем его
        return {
          message: 'Профиль уже существует',
          profile: user.profile
        };
      }
      
      console.log(`Создаем новый профиль для пользователя ID: ${userId}`);
      const profile = await this.usersService.createProfile(userId, createProfileDto);
      return {
        message: 'Профиль успешно создан',
        profile
      };
    } catch (error) {
      console.error(`Ошибка при создании профиля: ${error.message}`);
      throw new HttpException(
        error.message || 'Ошибка при создании профиля',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      const userId = req.user.sub;
      console.log(`Запрос на обновление профиля для пользователя ID: ${userId}`, updateProfileDto);
      
      const profile = await this.usersService.updateProfile(userId, updateProfileDto);
      return {
        message: 'Профиль успешно обновлен',
        profile
      };
    } catch (error) {
      console.error(`Ошибка при обновлении профиля: ${error.message}`);
      throw new HttpException(
        error.message || 'Ошибка при обновлении профиля',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
