import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    connected: boolean;
    error?: string;
  };
  environment: {
    nodeEnv: string;
    port: string;
    hasDatabaseUrl: boolean;
    hasJwtSecret: boolean;
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(private readonly prismaService: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    let dbConnected = false;
    let dbError: string | undefined;

    try {
      await this.prismaService.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (error) {
      dbConnected = false;
      dbError = error instanceof Error ? error.message : 'Unknown database error';
    }

    const isHealthy = dbConnected;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime,
      database: {
        connected: dbConnected,
        ...(dbError && { error: dbError }),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: process.env.PORT ?? '8000',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
    };
  }
}

