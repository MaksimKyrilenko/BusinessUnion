import { Injectable, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
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
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании пользователя: ' + error.message);
    }
  }

  async findOne(id: number): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ 
        where: { id },
        relations: ['profile']
      });
    } catch (error) {
      this.logger.error(`Error finding user with ID ${id}:`, error);
      throw new InternalServerErrorException('Ошибка при поиске пользователя');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ 
        where: { email },
        relations: ['profile']
      });
    } catch (error) {
      this.logger.error(`Error finding user with email ${email}:`, error);
      throw new InternalServerErrorException('Ошибка при поиске пользователя');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        relations: ['profile']
      });
    } catch (error) {
      this.logger.error('Error finding all users:', error);
      throw new InternalServerErrorException('Ошибка при получении списка пользователей');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        return user;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user with email ${email}:`, error);
      throw new InternalServerErrorException('Ошибка при валидации пользователя');
    }
  }

  async generateJwt(user: User) {
    try {
      const payload = { 
        email: user.email, 
        sub: user.id, 
        userType: user.userType 
      };
      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
      };
    } catch (error) {
      this.logger.error(`Error generating JWT for user ${user.id}:`, error);
      throw new InternalServerErrorException('Ошибка при генерации токена');
    }
  }

  async createProfile(userId: number, profileData: Partial<Profile>): Promise<Profile> {
    try {
      const user = await this.findOne(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      if (user.profile) {
        throw new Error('Профиль уже существует');
      }

      const profile = this.profileRepository.create({
        ...profileData,
        user
      });

      return await this.profileRepository.save(profile);
    } catch (error) {
      this.logger.error(`Error creating profile for user ${userId}:`, error);
      throw new InternalServerErrorException('Ошибка при создании профиля: ' + error.message);
    }
  }
}
