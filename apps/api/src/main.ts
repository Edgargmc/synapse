import { ZodError } from 'zod';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/presentation/http/api-exception.filter';
import { loadEnv } from './config/env';

async function bootstrap() {
  try {
    const env = loadEnv();
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: env.API_CORS_ORIGIN,
    });
    app.useGlobalFilters(new ApiExceptionFilter());

    await app.listen(env.API_PORT);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      throw new Error(`Invalid environment configuration: ${message}`);
    }

    throw error;
  }
}

void bootstrap();
