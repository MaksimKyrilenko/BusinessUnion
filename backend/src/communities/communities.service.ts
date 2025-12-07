import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityPostReaction } from './entities/community-post-reaction.entity';
import { CommunityCategory } from './entities/community-category.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

@Injectable()
export class CommunitiesService implements OnModuleInit {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    @InjectRepository(CommunityPost)
    private communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPostReaction)
    private communityPostReactionRepository: Repository<CommunityPostReaction>,
    @InjectRepository(CommunityCategory)
    private communityCategoryRepository: Repository<CommunityCategory>,
  ) {}

  async onModuleInit() {
    // Инициализируем категории при старте модуля
    await this.initializeCategories();
  }

  private async initializeCategories() {
    try {
      const existingCategories = await this.communityCategoryRepository.count();
      
      if (existingCategories === 0) {
        console.log('Инициализация категорий сообществ...');
        
        const categories = [
          { name: 'Стартапы', icon: 'fas fa-rocket', isActive: true },
          { name: 'Инвесторы', icon: 'fas fa-chart-line', isActive: true },
          { name: 'Бизнес', icon: 'fas fa-briefcase', isActive: true },
          { name: 'Крипто', icon: 'fas fa-coins', isActive: true },
        ];

        for (const categoryData of categories) {
          const category = this.communityCategoryRepository.create(categoryData);
          await this.communityCategoryRepository.save(category);
          console.log(`Создана категория: ${categoryData.name}`);
        }
        
        console.log('Категории сообществ успешно инициализированы!');
      }
    } catch (error) {
      console.error('Ошибка при инициализации категорий:', error);
    }
  }

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
      relations: ['creator', 'members', 'posts', 'posts.author', 'posts.author.profile'],
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
    
    // Проверяем, является ли пользователь создателем сообщества
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Сообщество не найдено');
    }

    if (community.creatorId === userId) {
      throw new ForbiddenException('Создатель не может покинуть сообщество. Используйте удаление сообщества.');
    }
    
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

    const savedPost = await this.communityPostRepository.save(post);
    
    // Загружаем автора с профилем для возврата полных данных
    const postWithAuthor = await this.communityPostRepository.findOne({
      where: { id: savedPost.id },
      relations: ['author', 'author.profile'],
    });

    return postWithAuthor || savedPost;
  }

  async getCommunityPosts(communityId: number, userId?: number): Promise<CommunityPost[]> {
    const posts = await this.communityPostRepository.find({
      where: { communityId },
      relations: ['author', 'author.profile', 'reactions', 'reactions.user'],
      order: { createdAt: 'DESC' },
    });

    // Если передан userId, добавляем информацию о том, лайкнул ли пользователь каждый пост
    if (userId) {
      for (const post of posts) {
        const userReaction = post.reactions?.find(r => r.userId === userId);
        (post as any).isLiked = !!userReaction;
      }
    }

    return posts;
  }

  async togglePostReaction(postId: number, userId: number): Promise<{ isLiked: boolean; likesCount: number }> {
    const post = await this.communityPostRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    // Проверяем, есть ли уже реакция от этого пользователя
    const existingReaction = await this.communityPostReactionRepository.findOne({
      where: { postId, userId },
    });

    if (existingReaction) {
      // Удаляем реакцию (убираем лайк)
      await this.communityPostReactionRepository.remove(existingReaction);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await this.communityPostRepository.save(post);
      return { isLiked: false, likesCount: post.likesCount };
    } else {
      // Создаем реакцию (добавляем лайк)
      const reaction = this.communityPostReactionRepository.create({
        postId,
        userId,
        type: 'like',
      });
      await this.communityPostReactionRepository.save(reaction);
      post.likesCount += 1;
      await this.communityPostRepository.save(post);
      return { isLiked: true, likesCount: post.likesCount };
    }
  }

  async incrementPostViews(postId: number): Promise<void> {
    const post = await this.communityPostRepository.findOne({
      where: { id: postId },
    });

    if (post) {
      post.viewsCount = (post.viewsCount || 0) + 1;
      await this.communityPostRepository.save(post);
    }
  }

  async getCategories(): Promise<CommunityCategory[]> {
    // Убеждаемся, что категории инициализированы
    const count = await this.communityCategoryRepository.count();
    if (count === 0) {
      await this.initializeCategories();
    }
    
    const categories = await this.communityCategoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    console.log(`Возвращаем ${categories.length} категорий`);
    return categories;
  }

  async getUserCommunities(userId: number): Promise<Community[]> {
    const members = await this.communityMemberRepository.find({
      where: { userId },
      relations: ['community', 'community.creator', 'community.members', 'community.posts'],
    });

    return members.map(member => member.community);
  }

  async getCommunityNotifications(userId: number, limit: number = 10): Promise<any[]> {
    const notifications: any[] = [];

    // Получаем сообщества, где пользователь является участником
    const userCommunities = await this.getUserCommunities(userId);
    const communityIds = userCommunities.map(c => c.id);

    if (communityIds.length === 0) {
      return [];
    }

    // Получаем недавние посты из сообществ пользователя (за последние 7 дней)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await this.communityPostRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('post.community', 'community')
      .where('post.communityId IN (:...communityIds)', { communityIds })
      .andWhere('post.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .orderBy('post.createdAt', 'DESC')
      .take(limit * 2)
      .getMany();

    // Фильтруем посты - исключаем свои посты
    const filteredPosts = recentPosts
      .filter(post => post.authorId !== userId) // Не показываем свои посты как уведомления
      .slice(0, limit);

    // Преобразуем посты в уведомления
    for (const post of filteredPosts) {
      const community = userCommunities.find(c => c.id === post.communityId);
      notifications.push({
        id: `post-${post.id}`,
        type: 'new_post',
        title: 'Новый пост в сообществе',
        message: `${post.author?.firstName || ''} ${post.author?.lastName || 'Пользователь'} опубликовал пост в "${community?.name || 'сообществе'}"`,
        content: post.content?.substring(0, 100) || '',
        authorName: `${post.author?.firstName || ''} ${post.author?.lastName || 'Пользователь'}`.trim(),
        communityId: post.communityId,
        communityName: community?.name || '',
        postId: post.id,
        timestamp: post.createdAt,
        icon: '💬',
      });
    }

    // Получаем реакции на посты пользователя
    const userPosts = await this.communityPostRepository.find({
      where: { authorId: userId },
      relations: ['reactions', 'reactions.user', 'community'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    for (const post of userPosts) {
      const recentReactions = await this.communityPostReactionRepository.find({
        where: { postId: post.id },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 5,
      });

      // Берем только реакции за последние 7 дней
      const filteredReactions = recentReactions.filter(
        reaction => new Date(reaction.createdAt) >= sevenDaysAgo && reaction.userId !== userId
      );

      for (const reaction of filteredReactions.slice(0, 3)) {
        notifications.push({
          id: `reaction-${reaction.id}`,
          type: 'reaction',
          title: 'Реакция на ваш пост',
          message: `${reaction.user?.firstName || ''} ${reaction.user?.lastName || 'Пользователь'} оценил ваш пост`,
          content: post.content?.substring(0, 100) || '',
          authorName: `${reaction.user?.firstName || ''} ${reaction.user?.lastName || 'Пользователь'}`.trim(),
          communityId: post.communityId,
          communityName: post.community?.name || '',
          postId: post.id,
          timestamp: reaction.createdAt,
          icon: '👍',
        });
      }
    }

    // Сортируем по дате (новые первыми) и ограничиваем количество
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return notifications.slice(0, limit);
  }
}
