import { API_PREFIX, SWAGGER_PATH } from '@infrastructure/constants/common/api.constants.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { buildGlobalValidationPipe } from '@infrastructure/globals/global-validation.pipe.js';
import { parseCorsOrigins } from '@infrastructure/helpers/common/cors.helper.js';
import type { TConfigService } from '@infrastructure/types/common/env.types.js';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  app.enableCors({
    origin: parseCorsOrigins(configService.get('CORS_ORIGINS', { infer: true })),
    credentials: true,
  });
  app.useGlobalPipes(buildGlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  if (configService.get('SWAGGER_ENABLED', { infer: true })) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Squad of Champions API')
        .setDescription('Characters, authentication and squad management for Squad of Champions.')
        .setVersion('1.0.0')
        .addBearerAuth()
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
