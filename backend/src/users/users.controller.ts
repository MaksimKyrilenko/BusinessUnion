import { Controller, Get, Post, Body, Param, UnauthorizedException, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
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
      const user = await this.usersService.findOne(req.user.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profile: user.profile
      };
    } catch (error) {
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
      const profile = await this.usersService.createProfile(req.user.sub, createProfileDto);
      return {
        message: 'Профиль успешно создан',
        profile
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка при создании профиля',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
