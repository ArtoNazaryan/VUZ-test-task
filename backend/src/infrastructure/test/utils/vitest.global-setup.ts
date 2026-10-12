import { NestFactory } from '@nestjs/core';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';

async function seedCharacters(): Promise<void> {
  const { SeedModule } = await import('@infrastructure/seed/seed.module.js');
  const { CharacterSeedService } =
    await import('@infrastructure/seed/services/character-seed.service.js');
  const context = await NestFactory.createApplicationContext(SeedModule, { logger: false });

  await context.get(CharacterSeedService).seed();
  await context.close();
}

export default async function setup(): Promise<() => Promise<void>> {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();

  process.env.DATABASE_URL = container.getConnectionUri();
  process.env.REDIS_URL ??= 'redis://localhost:6379';
  process.env.LOG_LEVEL = 'silent';

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { env: process.env, stdio: 'ignore' });
  await seedCharacters();

  return async (): Promise<void> => {
    await container.stop();
  };
}
