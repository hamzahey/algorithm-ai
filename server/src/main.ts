import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}

void bootstrap();
