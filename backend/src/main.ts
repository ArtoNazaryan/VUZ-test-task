import { API_PREFIX, SWAGGER_PATH } from '@infrastructure/common/constants/api.constants.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { buildGlobalValidationPipe } from '@infrastructure/globals/global-validation.pipe.js';
import { parseCorsOrigins } from '@infrastructure/common/helpers/cors.helper.js';
import { RedisIoAdapter } from '@infrastructure/realtime/adapters/redis-io.adapter.js';
import type { TConfigService } from '@infrastructure/common/types/env.types.js';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  const configService = app.get<TConfigService>(ConfigService);

  app.useLogger(logger);
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.use(cookieParser());
  const corsOrigins = parseCorsOrigins(configService.get('CORS_ORIGINS', { infer: true }));
  const redisIoAdapter = new RedisIoAdapter(app, corsOrigins);

  redisIoAdapter.connectToRedis(configService.get('REDIS_URL', { infer: true }));
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useGlobalPipes(buildGlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  if (configService.get('SWAGGER_ENABLED', { infer: true })) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Squad of Champions API')
        .setDescription(
          'Characters, authentication and squad management for Squad of Champions. Squad and profile endpoints need an access token: log in, then click Authorize and paste the accessToken. The refresh token travels in the httpOnly refresh_token cookie. Every error uses the ErrorResponseDto shape.',
        )
        .setVersion('1.0.0')
        .addTag('Auth', 'Register, log in, refresh the access token and log out')
        .addTag(
          'Characters',
          'The character catalogue: list with filters, details and filter values',
        )
        .addTag('Squads', 'Your squads of up to 6 characters with ability averages')
        .addTag('Health', 'Liveness of the API, PostgreSQL and Redis')
        .addBearerAuth()
        .addCookieAuth('refresh_token')
        .build(),
    );

    SwaggerModule.setup(SWAGGER_PATH, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get('PORT', { infer: true });

  await app.listen(port, '0.0.0.0');
  logger.log(`[Bootstrap] API listening on port ${port}`);
}

void bootstrap();
