import 'dotenv/config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDb } from '@agent-ts/db';
import { createTrpcMiddleware } from '@agent-ts/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');

  try {
    const db = createDb();
    app.use('/api/trpc', createTrpcMiddleware({ db }));
    Logger.log('tRPC middleware mounted at /api/trpc', 'Bootstrap');
  } catch (error) {
    Logger.warn(`tRPC initialization skipped: ${(error as Error).message}`, 'Bootstrap');
  }

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  Logger.log(`🚀 Backend ready at http://localhost:${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exit(1);
});
