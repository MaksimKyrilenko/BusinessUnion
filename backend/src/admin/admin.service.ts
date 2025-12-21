import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { User } from '../users/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Project } from '../projects/project.entity';
import { Investment } from '../investments/investment.entity';
import { Community } from '../communities/entities/community.entity';
import { UserType } from '../users/enums/user-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
  ) {}

  // ==================== DASHBOARD STATISTICS ====================

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalProjects = await this.projectRepository.count();
    const totalInvestments = await this.investmentRepository.count();
    const totalCommunities = await this.communityRepository.count();

    // Users by type
    const usersByType = await this.userRepository
      .createQueryBuilder('user')
      .select('user.userType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.userType')
      .getRawMany();

    // Projects by status
    const projectsByStatus = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('project.status')
      .getRawMany();

    // Total investment amount
    const investmentStats = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('SUM(investment.amount)', 'totalAmount')
      .addSelect('AVG(investment.amount)', 'avgAmount')
      .getRawOne();

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await this.userRepository.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) },
    });

    // Recent projects (last 30 days)
    const recentProjects = await this.projectRepository.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) },
    });

    return {
      overview: {
        totalUsers,
        totalProjects,
        totalInvestments,
        totalCommunities,
        recentUsers,
        recentProjects,
      },
      usersByType,
      projectsByStatus,
      investmentStats: {
        totalAmount: parseFloat(investmentStats?.totalAmount) || 0,
        avgAmount: parseFloat(investmentStats?.avgAmount) || 0,
        count: totalInvestments,
      },
    };
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(page = 1, limit = 20, search?: string, userType?: UserType) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      users: users.map(user => ({
        ...user,
        password: undefined, // Remove password from response
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'projects', 'investments'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { ...user, password: undefined };
  }

  async updateUser(id: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Don't allow changing password through this endpoint
    delete updateData.password;

    await this.userRepository.update(id, updateData);
    return this.getUserById(id);
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.userType === UserType.ADMIN) {
      throw new BadRequestException('Нельзя удалить администратора');
    }

    await this.userRepository.delete(id);
    return { message: 'Пользователь удалён' };
  }

  async setUserRole(id: number, userType: UserType) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.userRepository.update(id, { userType });
    return this.getUserById(id);
  }


  // ==================== PROJECT MANAGEMENT ====================

  async getProjects(page = 1, limit = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.author', 'author')
      .orderBy('project.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    const [projects, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['author', 'investments', 'teamMembers'],
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return project;
  }

  async updateProject(id: number, updateData: Partial<Project>) {
    const project = await this.projectRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    await this.projectRepository.update(id, updateData);
    return this.getProjectById(id);
  }

  async updateProjectStatus(id: number, status: 'pending' | 'active' | 'completed' | 'cancelled') {
    const project = await this.projectRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    await this.projectRepository.update(id, { status });
    return this.getProjectById(id);
  }

  async deleteProject(id: number) {
    const project = await this.projectRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    await this.projectRepository.delete(id);
    return { message: 'Проект удалён' };
  }

  // ==================== INVESTMENT MANAGEMENT ====================

  async getInvestments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [investments, total] = await this.investmentRepository.findAndCount({
      relations: ['investor', 'project'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvestmentById(id: number) {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['investor', 'project'],
    });

    if (!investment) {
      throw new NotFoundException('Инвестиция не найдена');
    }

    return investment;
  }

  // ==================== COMMUNITY MANAGEMENT ====================

  async getCommunities(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.creator', 'creator')
      .loadRelationCountAndMap('community.membersCount', 'community.members')
      .orderBy('community.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(community.name LIKE :search OR community.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [communities, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCommunityById(id: number) {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'members'],
    });

    if (!community) {
      throw new NotFoundException('Сообщество не найдено');
    }

    return community;
  }

  async deleteCommunity(id: number) {
    const community = await this.communityRepository.findOne({ where: { id } });
    
    if (!community) {
      throw new NotFoundException('Сообщество не найдено');
    }

    await this.communityRepository.delete(id);
    return { message: 'Сообщество удалено' };
  }

  // ==================== ANALYTICS ====================

  async getRegistrationStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return stats;
  }

  async getProjectStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.projectRepository
      .createQueryBuilder('project')
      .select('DATE(project.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('project.createdAt >= :startDate', { startDate })
      .groupBy('DATE(project.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return stats;
  }

  async getInvestmentStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.investmentRepository
      .createQueryBuilder('investment')
      .select('DATE(investment.createdAt)', 'date')
      .addSelect('SUM(investment.amount)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where('investment.createdAt >= :startDate', { startDate })
      .groupBy('DATE(investment.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return stats;
  }
}
