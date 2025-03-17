import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  async create(
    @Body() createInvestmentDto: { amount: number; projectId: number },
    @Request() req,
  ) {
    return this.investmentsService.create({
      ...createInvestmentDto,
      investorId: req.user.id,
    });
  }

  @Get()
  findAll() {
    return this.investmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investmentsService.findOne(+id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.investmentsService.findByProject(+projectId);
  }

  @Get('investor/:investorId')
  findByInvestor(@Param('investorId') investorId: string) {
    return this.investmentsService.findByInvestor(+investorId);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'approved' | 'rejected',
  ) {
    return this.investmentsService.updateStatus(+id, status);
  }

  @Put(':id/roi')
  updateRoi(@Param('id') id: string, @Body('actualRoi') actualRoi: number) {
    return this.investmentsService.updateRoi(+id, actualRoi);
  }
} 