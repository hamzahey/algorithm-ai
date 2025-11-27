import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async list(@Req() req: RequestWithUser) {
    return this.jobsService.listForUser(req.user!.userId);
  }

  @Get(':id')
  async get(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.jobsService.getOne(req.user!.userId, id);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user!.userId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(req.user!.userId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.jobsService.delete(req.user!.userId, id);
    return { message: 'Job deleted' };
  }
}
