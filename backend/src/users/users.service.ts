import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.role = 'user';

    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async generateJwt(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token, // возвращаем access_token
    };
  }
}
