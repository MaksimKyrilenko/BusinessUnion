import { Controller, Post, Body, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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
            username: user.username,
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

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const token = await this.usersService.generateJwt(user);
      return { 
        message: 'Регистрация успешна!', 
        access_token: token.access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.userType,
          profile: user.profile
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ошибка при регистрации',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
