import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (user) {
      const token = await this.usersService.generateJwt(user);
      return { message: 'Вход выполнен успешно', access_token: token.access_token };
    } else {
      throw new UnauthorizedException('Неверный email или пароль');
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'Регистрация успешна!', user };
  }
}
