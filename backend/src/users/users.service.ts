import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from './entities/profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserType } from './enums/user-type.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${createUserDto.email}`);

    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email }
      });

      if (existingUser) {
        this.logger.warn(`User with email ${createUserDto.email} already exists`);
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Создаем нового пользователя
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      this.logger.log('Saving new user to database');
      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User successfully created with ID: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: ['profile']
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async generateJwt(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      userType: user.userType 
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }
}
