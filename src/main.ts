import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(json({ limit: '500mb' }))
  app.use(urlencoded({ limit: '500mb', extended: true }))

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
  })
  await app.listen(21000);
}
bootstrap();
