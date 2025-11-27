import { Controller, Get, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs/search')
export class JobsDiscoveryController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('tags') tags?: string | string[],
    @Query('mode') mode: 'and' | 'or' = 'and',
  ) {
    const normalizedTags = tags
      ? (Array.isArray(tags) ? tags : tags.split(','))
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    return this.jobsService.searchPublic({
      search,
      tags: normalizedTags,
      mode: mode === 'or' ? 'or' : 'and',
    });
  }
}
