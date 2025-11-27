import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { AdminSeedService } from './admin-seed.service';

@Module({
  imports: [PrismaModule, JobsModule],
  controllers: [AdminController],
  providers: [AdminGuard, AdminSeedService],
})
export class AdminModule {}
