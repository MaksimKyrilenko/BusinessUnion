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
      
      // Автоматически создаем профиль для нового пользователя
      try {
        this.logger.log(`Creating profile for user ID: ${savedUser.id}`);
        const profile = this.profileRepository.create({
          user: savedUser
        });
        
        const savedProfile = await this.profileRepository.save(profile);
        this.logger.log(`Profile successfully created for user ID: ${savedUser.id}, profile ID: ${savedProfile.id}`);

        // Обновляем пользователя с профилем
        savedUser.profile = savedProfile;
        
        // Проверяем, что профиль правильно связан с пользователем
        const userWithProfile = await this.findOne(savedUser.id);
        if (!userWithProfile?.profile) {
          this.logger.warn(`Profile not attached to user ID: ${savedUser.id} after creation`);
        } else {
          this.logger.log(`Verified profile is attached to user ID: ${savedUser.id}, profile ID: ${userWithProfile.profile.id}`);
        }
      } catch (profileError) {
        this.logger.error(`Error creating profile for user ${savedUser.id}:`, profileError);
        // Продолжаем выполнение, даже если не удалось создать профиль
      }
      
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
      this.logger.log(`Creating profile for user ID: ${userId}`);
      
      const user = await this.findOne(userId);
      if (!user) {
        this.logger.error(`User with ID ${userId} not found when creating profile`);
        throw new Error('Пользователь не найден');
      }

      if (user.profile) {
        this.logger.warn(`User with ID ${userId} already has a profile`);
        // Возвращаем существующий профиль
        return user.profile;
      }

      const profile = this.profileRepository.create({
        ...profileData,
        user
      });

      const savedProfile = await this.profileRepository.save(profile);
      this.logger.log(`Profile created for user ID: ${userId}, profile ID: ${savedProfile.id}`);
      
      // Дополнительная проверка, что профиль действительно привязан к пользователю
      const userAfterProfileCreation = await this.findOne(userId);
      if (!userAfterProfileCreation?.profile) {
        this.logger.warn(`Profile appears to be created but not attached to user ID: ${userId}`);
      }
      
      return savedProfile;
    } catch (error) {
      this.logger.error(`Error creating profile for user ${userId}:`, error);
      throw new InternalServerErrorException('Ошибка при создании профиля: ' + error.message);
    }
  }

  async updateProfile(userId: number, profileData: Partial<Profile>): Promise<Profile> {
    try {
      this.logger.log(`Updating profile for user ID: ${userId}`);
      
      const user = await this.findOne(userId);
      if (!user) {
        this.logger.error(`User with ID ${userId} not found when updating profile`);
        throw new Error('Пользователь не найден');
      }

      if (!user.profile) {
        this.logger.warn(`User with ID ${userId} does not have a profile, creating one`);
        // Если профиля нет, создаем его
        return await this.createProfile(userId, profileData);
      }

      // Предварительная обработка данных
      const processedData = { ...profileData };
      
      // Обрабатываем числовые поля
      if (processedData.investmentSize !== undefined) {
        // Убедимся, что investmentSize - число
        processedData.investmentSize = Number(processedData.investmentSize);
        
        // Если получился NaN, устанавливаем 0
        if (isNaN(processedData.investmentSize)) {
          processedData.investmentSize = 0;
        }
      }
      
      // Обновляем профиль
      this.logger.log(`Updating profile ID: ${user.profile.id} for user ID: ${userId}`);
      await this.profileRepository.update(user.profile.id, processedData);
      
      // Получаем обновленный профиль
      const updatedProfile = await this.profileRepository.findOne({
        where: { id: user.profile.id }
      });

      if (!updatedProfile) {
        this.logger.error(`Could not find updated profile for user ID: ${userId} after update`);
        throw new Error('Не удалось получить обновленный профиль');
      }

      this.logger.log(`Profile successfully updated for user ID: ${userId}, profile ID: ${updatedProfile.id}`);
      return updatedProfile;
    } catch (error) {
      this.logger.error(`Error updating profile for user ${userId}:`, error);
      throw new InternalServerErrorException('Ошибка при обновлении профиля: ' + error.message);
    }
  }
}
