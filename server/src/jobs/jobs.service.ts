import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listForUser(userId: string) {
    return this.prismaService.prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateJobDto) {
    const sanitizedTags = dto.tags.map((tag) => tag.trim()).filter(Boolean);

    return this.prismaService.prisma.job.create({
      data: {
        userId,
        title: dto.title,
        company: dto.company,
        description: dto.description,
        salary: dto.salary,
        tags: sanitizedTags,
      },
    });
  }

  private async ensureOwnership(userId: string, jobId: string) {
    const job = await this.prismaService.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenException('Not authorized to modify this job');
    }

    return job;
  }

  async update(userId: string, jobId: string, dto: UpdateJobDto) {
    await this.ensureOwnership(userId, jobId);

    const updateData: Partial<CreateJobDto> = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.company) updateData.company = dto.company;
    if (dto.description) updateData.description = dto.description;
    if (dto.salary) updateData.salary = dto.salary;
    if (dto.tags)
      updateData.tags = dto.tags.map((tag) => tag.trim()).filter(Boolean);

    return this.prismaService.prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });
  }

  async delete(userId: string, jobId: string) {
    await this.ensureOwnership(userId, jobId);

    await this.prismaService.prisma.job.delete({
      where: { id: jobId },
    });
  }

  async getOne(userId: string, jobId: string) {
    return this.ensureOwnership(userId, jobId);
  }
}
