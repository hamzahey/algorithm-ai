import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { JobsModule } from './jobs/jobs.module';
import { ProtectedController } from './protected/protected.controller';
import { PrismaModule } from './prisma';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, AuthModule, JobsModule, AdminModule, HealthModule],
  controllers: [AppController, ProtectedController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'protected/*',
      method: RequestMethod.ALL,
    });
  }
}
