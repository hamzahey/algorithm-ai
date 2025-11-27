import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const sanitizedTags = this.normalizeTags(dto.tags);

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
    if (dto.tags) updateData.tags = this.normalizeTags(dto.tags);

    return this.prismaService.prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });
  }

  private normalizeTags(tags: string[]) {
    return Array.from(
      new Set(
        tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
      ),
    );
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

  async searchPublic(options: {
    search?: string;
    tags?: string[];
    mode?: 'and' | 'or';
  }) {
    const { search, tags, mode = 'and' } = options;
    const predicates: Prisma.JobWhereInput[] = [];

    if (search?.trim()) {
      const term = search.trim();
      predicates.push({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { salary: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (tags?.length) {
      predicates.push({
        tags: mode === 'or' ? { hasSome: tags } : { hasEvery: tags },
      });
    }

    const whereClause = { approved: true } as Prisma.JobWhereInput;
    if (predicates.length) {
      whereClause.AND = predicates;
    }

    return this.prismaService.prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        salary: true,
        tags: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async listForModeration(approved?: boolean) {
    const where = approved === undefined ? undefined : ({ approved } as Prisma.JobWhereInput);
    return this.prismaService.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async setApproval(jobId: string, approved: boolean) {
    await this.prismaService.prisma.job.update({
      where: { id: jobId },
      data: { approved } as Prisma.JobUpdateInput,
    });
  }

  async deleteForAdmin(jobId: string) {
    await this.prismaService.prisma.job.delete({
      where: { id: jobId },
    });
  }
}
