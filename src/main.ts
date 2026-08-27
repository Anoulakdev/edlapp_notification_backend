/* eslint-disable @typescript-eslint/no-floating-promises */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { AppModule } from './app.module';
import express from 'express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());
  app.use(compression());

  const allowedOrigins = [
    'http://localhost:4600',
    'http://192.168.20.233:4600',
    'https://app-portal.edl.com.la',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const uploadBasePath = process.env.UPLOAD_BASE_PATH;
  if (!uploadBasePath) {
    throw new Error('UPLOAD_BASE_PATH is not defined');
  }

  app.use(
    '/upload',
    express.static(path.resolve(uploadBasePath), {
      maxAge: '7d',
      etag: true,
    }),
  );

  const port = process.env.PORT || 4500;
  await app.listen(port);
}
bootstrap();
