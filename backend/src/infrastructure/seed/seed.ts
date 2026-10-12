import { SeedModule } from '@infrastructure/seed/seed.module.js';
import { CharacterSeedService } from '@infrastructure/seed/services/character-seed.service.js';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

async function runSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  await app.get(CharacterSeedService).seed();
  await app.close();
}

await runSeed();
