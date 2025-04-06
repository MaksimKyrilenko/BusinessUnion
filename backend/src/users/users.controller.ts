import { Controller, Get, Post, Body, Param, UnauthorizedException, HttpException, HttpStatus, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

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
  @Get('search')
  async searchUsers(@Request() req) {
    try {
      const { q } = req.query;
      this.logger.log(`Получен запрос на поиск пользователей с query: ${q}, тип: ${typeof q}`);
      
      // Проверка на пустой запрос
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        this.logger.warn(`Слишком короткий или пустой запрос для поиска: "${q}"`);
        return [];
      }
      
      // Получаем информацию о текущем пользователе
      let currentUserId: number | null = null;
      try {
        // Безопасно извлекаем ID пользователя из токена
        if (req.user && req.user.sub) {
          // Убедимся, что ID преобразуется в число корректно
          const userIdStr = String(req.user.sub).trim();
          const parsedId = parseInt(userIdStr, 10);
          
          if (isNaN(parsedId)) {
            this.logger.warn(`Некорректный ID пользователя в токене: "${req.user.sub}", тип: ${typeof req.user.sub}`);
          } else {
            currentUserId = parsedId;
            this.logger.log(`Текущий пользователь ID: ${currentUserId} (преобразован из "${req.user.sub}")`);
          }
        } else {
          this.logger.warn('ID пользователя отсутствует в токене JWT');
        }
      } catch (error) {
        this.logger.warn(`Ошибка при извлечении ID пользователя из токена: ${error.message}`);
      }
      
      // Ищем пользователей
      const users = await this.usersService.searchUsers(q.trim());
      this.logger.log(`Найдено ${users.length} пользователей по запросу "${q}"`);
      
      // Фильтруем и форматируем результаты
      const results = users
        .filter(user => {
          // Проверка валидности ID пользователя
          if (!user.id) {
            this.logger.warn(`Найден пользователь без ID: ${user.firstName} ${user.lastName}`);
            return false;
          }
          
          // Исключаем текущего пользователя из результатов только если ID корректен
          const shouldInclude = currentUserId === null || user.id !== currentUserId;
          if (!shouldInclude) {
            this.logger.log(`Исключаем текущего пользователя из результатов: ID ${user.id}`);
          }
          return shouldInclude;
        })
        .map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.profile?.avatar || null,
          userType: user.userType
        }));
      
      this.logger.log(`Возвращаем ${results.length} пользователей после фильтрации`);
      return results;
    } catch (error) {
      this.logger.error(`Ошибка при поиске пользователей: ${error.message}`);
      throw new HttpException(
        error.message || 'Ошибка при поиске пользователей',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      // Преобразуем ID в число
      const userId = parseInt(id.trim(), 10);
      
      if (isNaN(userId)) {
        this.logger.error(`Некорректный ID пользователя: "${id}"`);
        throw new HttpException('Некорректный ID пользователя', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Запрос на получение пользователя с ID: ${userId}`);
      
      const user = await this.usersService.findOne(userId);
      if (!user) {
        this.logger.warn(`Пользователь с ID ${userId} не найден`);
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }
      
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Ошибка при получении пользователя: ${error.message}`);
      throw new HttpException(
        'Ошибка при получении пользователя',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
      // Безопасно извлекаем ID пользователя из токена
      let userId: number;
      try {
        const userIdStr = String(req.user.sub).trim();
        userId = parseInt(userIdStr, 10);
        
        if (isNaN(userId)) {
          this.logger.error(`Некорректный ID пользователя в токене: "${req.user.sub}"`);
          throw new HttpException('Некорректный ID пользователя', HttpStatus.BAD_REQUEST);
        }
      } catch (error) {
        this.logger.error(`Ошибка при обработке ID пользователя: ${error.message}`);
        throw new HttpException('Ошибка при обработке ID пользователя', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Запрос на создание профиля для пользователя ID: ${userId}`);
      
      // Проверим, есть ли уже профиль у пользователя
      const user = await this.usersService.findOne(userId);
      if (!user) {
        this.logger.error(`Пользователь с ID ${userId} не найден`);
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }
      
      if (user.profile) {
        this.logger.log(`Профиль уже существует для пользователя ID: ${userId}`);
        // Если профиль уже существует, возвращаем его
        return {
          message: 'Профиль уже существует',
          profile: user.profile
        };
      }
      
      this.logger.log(`Создаем новый профиль для пользователя ID: ${userId}`);
      const profile = await this.usersService.createProfile(userId, createProfileDto);
      return {
        message: 'Профиль успешно создан',
        profile
      };
    } catch (error) {
      this.logger.error(`Ошибка при создании профиля: ${error.message}`);
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
      // Безопасно извлекаем ID пользователя из токена
      let userId: number;
      try {
        const userIdStr = String(req.user.sub).trim();
        userId = parseInt(userIdStr, 10);
        
        if (isNaN(userId)) {
          this.logger.error(`Некорректный ID пользователя в токене при обновлении профиля: "${req.user.sub}"`);
          throw new HttpException('Некорректный ID пользователя', HttpStatus.BAD_REQUEST);
        }
      } catch (error) {
        this.logger.error(`Ошибка при обработке ID пользователя: ${error.message}`);
        throw new HttpException('Ошибка при обработке ID пользователя', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Запрос на обновление профиля для пользователя ID: ${userId}`, updateProfileDto);
      
      const profile = await this.usersService.updateProfile(userId, updateProfileDto);
      return {
        message: 'Профиль успешно обновлен',
        profile
      };
    } catch (error) {
      this.logger.error(`Ошибка при обновлении профиля: ${error.message}`);
      throw new HttpException(
        error.message || 'Ошибка при обновлении профиля',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
