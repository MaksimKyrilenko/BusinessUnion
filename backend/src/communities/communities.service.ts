import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityCategory } from './entities/community-category.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    @InjectRepository(CommunityPost)
    private communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityCategory)
    private communityCategoryRepository: Repository<CommunityCategory>,
  ) {}

  async create(createCommunityDto: CreateCommunityDto, creatorId: number): Promise<Community> {
    console.log('Service: Creating community with DTO:', createCommunityDto);
    console.log('Service: Creator ID:', creatorId);
    
    const community = this.communityRepository.create({
      ...createCommunityDto,
      creatorId,
    });

    console.log('Service: Created community object:', community);

    const savedCommunity = await this.communityRepository.save(community);
    console.log('Service: Community saved with ID:', savedCommunity.id);

    // Автоматически добавляем создателя как участника
    try {
      const member = this.communityMemberRepository.create({
        communityId: savedCommunity.id,
        userId: creatorId,
      });
      
      await this.communityMemberRepository.save(member);
      console.log('Service: Creator added as member successfully');
    } catch (error) {
      console.error('Service: Error adding creator as member:', error);
      // Не выбрасываем ошибку, так как сообщество уже создано
    }

    return savedCommunity;
  }

  async findAll(): Promise<Community[]> {
    console.log('Service: Finding all communities with relations');
    const communities = await this.communityRepository.find({
      relations: ['creator', 'members', 'posts'],
    });
    
    console.log('Service: Found communities:', communities.map(c => ({
      id: c.id,
      name: c.name,
      membersCount: c.members?.length || 0,
      members: c.members?.map(m => ({ id: m.id, userId: m.userId })) || []
    })));
    
    return communities;
  }

  async findOne(id: number): Promise<Community> {
    console.log('Service: Finding community by ID:', id);
    
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'posts', 'posts.author'],
    });

    if (!community) {
      throw new NotFoundException('Сообщество не найдено');
    }

    console.log('Service: Found community:', {
      id: community.id,
      name: community.name,
      creatorId: community.creatorId,
      membersCount: community.members?.length || 0
    });

    return community;
  }

  async update(id: number, updateCommunityDto: UpdateCommunityDto, userId: number): Promise<Community> {
    const community = await this.findOne(id);
    
    if (community.creatorId !== userId) {
      throw new ForbiddenException('Только создатель может редактировать сообщество');
    }

    Object.assign(community, updateCommunityDto);
    return this.communityRepository.save(community);
  }

  async remove(id: number, userId: number): Promise<void> {
    const community = await this.findOne(id);
    
    if (community.creatorId !== userId) {
      throw new ForbiddenException('Только создатель может удалить сообщество');
    }

    await this.communityRepository.remove(community);
  }

  async joinCommunity(communityId: number, userId: number): Promise<CommunityMember> {
    console.log('Service: Joining community', { communityId, userId });
    
    // Проверяем, не является ли пользователь уже участником
    const existingMember = await this.communityMemberRepository.findOne({
      where: { communityId, userId },
    });

    console.log('Service: Existing member check:', existingMember);

    if (existingMember) {
      console.log('Service: User is already a member, returning existing member');
      return existingMember; // Возвращаем существующего участника вместо ошибки
    }

    const member = this.communityMemberRepository.create({
      communityId,
      userId,
    });

    console.log('Service: Creating new member:', member);

    return this.communityMemberRepository.save(member);
  }

  async leaveCommunity(communityId: number, userId: number): Promise<void> {
    console.log('Service: Leaving community', { communityId, userId });
    
    const member = await this.communityMemberRepository.findOne({
      where: { communityId, userId },
    });

    console.log('Service: Found member to leave:', member);

    if (!member) {
      console.log('Service: User is not a member, nothing to do');
      return; // Не выбрасываем ошибку, просто ничего не делаем
    }

    await this.communityMemberRepository.remove(member);
    console.log('Service: Successfully left community');
  }

  async isMember(communityId: number, userId: number): Promise<boolean> {
    const member = await this.communityMemberRepository.findOne({
      where: { communityId, userId },
    });

    return !!member;
  }

  async createPost(communityId: number, createPostDto: CreateCommunityPostDto, authorId: number): Promise<CommunityPost> {
    console.log('Service: Creating post', { communityId, authorId });
    
    // Проверяем, является ли пользователь создателем сообщества
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Сообщество не найдено');
    }

    console.log('Service: Community found:', { creatorId: community.creatorId, authorId });

    if (community.creatorId !== authorId) {
      console.log('Service: User is not creator, throwing ForbiddenException');
      throw new ForbiddenException('Только создатель сообщества может создавать посты');
    }

    const post = this.communityPostRepository.create({
      ...createPostDto,
      communityId,
      authorId,
    });

    console.log('Service: Creating post:', post);

    return this.communityPostRepository.save(post);
  }

  async getCommunityPosts(communityId: number): Promise<CommunityPost[]> {
    return this.communityPostRepository.find({
      where: { communityId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCategories(): Promise<CommunityCategory[]> {
    return this.communityCategoryRepository.find({
      where: { isActive: true },
    });
  }

  async getUserCommunities(userId: number): Promise<Community[]> {
    const members = await this.communityMemberRepository.find({
      where: { userId },
      relations: ['community', 'community.creator', 'community.members', 'community.posts'],
    });

    return members.map(member => member.community);
  }
}
