import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsDiscoveryController } from './jobs.discovery.controller';
import { JobsService } from './jobs.service';

@Module({
  controllers: [JobsDiscoveryController, JobsController],
  providers: [JobsService],
})
export class JobsModule {}
