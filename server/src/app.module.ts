import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { ProtectedController } from './protected/protected.controller';
import { PrismaModule } from './prisma';
import { AuthMiddleware } from './auth/middleware/auth.middleware';

@Module({
  imports: [PrismaModule, AuthModule],
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
