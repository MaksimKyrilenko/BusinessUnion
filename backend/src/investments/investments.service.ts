import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(investmentData: {
    amount: number;
    projectId: number;
    investorId: number;
  }): Promise<Investment> {
    const project = await this.projectRepository.findOne({
      where: { id: investmentData.projectId },
      relations: ['investments'],
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    const investor = await this.userRepository.findOne({
      where: { id: investmentData.investorId },
    });

    if (!investor) {
      throw new NotFoundException('Инвестор не найден');
    }

    const investment = this.investmentRepository.create({
      amount: investmentData.amount,
      project,
      investor,
      status: 'pending',
    });

    return this.investmentRepository.save(investment);
  }

  async findAll(): Promise<Investment[]> {
    return this.investmentRepository.find({
      relations: ['project', 'investor'],
    });
  }

  async findOne(id: number): Promise<Investment> {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['project', 'investor'],
    });

    if (!investment) {
      throw new NotFoundException('Инвестиция не найдена');
    }

    return investment;
  }

  async findByProject(projectId: number): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { project: { id: projectId } },
      relations: ['investor'],
    });
  }

  async findByInvestor(investorId: number): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { investor: { id: investorId } },
      relations: ['project'],
    });
  }

  async updateStatus(id: number, status: Investment['status']): Promise<Investment> {
    const investment = await this.findOne(id);
    investment.status = status;
    return this.investmentRepository.save(investment);
  }

  async updateRoi(id: number, actualRoi: number): Promise<Investment> {
    const investment = await this.findOne(id);
    investment.actualRoi = actualRoi;
    return this.investmentRepository.save(investment);
  }
} 