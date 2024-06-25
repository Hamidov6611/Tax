import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX, originalUrl } from './config/const';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: originalUrl,
    credentials: true
  })

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
