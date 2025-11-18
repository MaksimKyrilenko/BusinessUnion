import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  create(@Body() createCommunityDto: CreateCommunityDto, @Request() req) {
    console.log('Creating community with data:', createCommunityDto);
    console.log('User from request:', req.user);
    console.log('User ID (sub):', req.user?.sub);
    
    if (!req.user || !req.user.sub) {
      throw new Error('User not authenticated');
    }
    
    return this.communitiesService.create(createCommunityDto, req.user.sub);
  }

  @Get()
  @Public()
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get('categories')
  @Public()
  getCategories() {
    return this.communitiesService.getCategories();
  }

  @Get('my')
  getUserCommunities(@Request() req) {
    return this.communitiesService.getUserCommunities(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityDto: UpdateCommunityDto, @Request() req) {
    return this.communitiesService.update(+id, updateCommunityDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.communitiesService.remove(+id, req.user.sub);
  }

  @Post(':id/join')
  joinCommunity(@Param('id') id: string, @Request() req) {
    console.log('Controller: Joining community', { id, userId: req.user?.sub });
    return this.communitiesService.joinCommunity(+id, req.user.sub);
  }

  @Post(':id/leave')
  leaveCommunity(@Param('id') id: string, @Request() req) {
    return this.communitiesService.leaveCommunity(+id, req.user.sub);
  }

  @Get(':id/posts')
  getCommunityPosts(@Param('id') id: string) {
    return this.communitiesService.getCommunityPosts(+id);
  }

  @Post(':id/posts')
  createPost(@Param('id') id: string, @Body() createPostDto: CreateCommunityPostDto, @Request() req) {
    return this.communitiesService.createPost(+id, createPostDto, req.user.sub);
  }
}
