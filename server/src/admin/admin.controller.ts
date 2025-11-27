import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  @Get('users')
  async listUsers() {
    const users = await this.prismaService.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      jobCount: user._count.jobs,
    }));
  }

  @Get('jobs')
  async listJobs(@Query('approved') approved?: string) {
    const approvedFilter =
      approved === undefined ? undefined : approved === 'true';

    const jobs = await this.jobsService.listForModeration(approvedFilter);
    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      salary: job.salary,
      tags: job.tags,
      status: job.status,
      approved: job.approved,
      createdAt: job.createdAt,
      user: job.user,
    }));
  }

  @Patch('jobs/:id/approve')
  async approveJob(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
  ) {
    await this.jobsService.setApproval(id, approved);
    return { success: true };
  }

  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    await this.jobsService.deleteForAdmin(id);
    return { success: true };
  }
}
