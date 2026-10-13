import { NestFactory } from '@nestjs/core';
import { MongoDBContainer } from '@testcontainers/mongodb';
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
  const [postgres, mongo] = await Promise.all([
    new PostgreSqlContainer('postgres:17-alpine').start(),
    new MongoDBContainer('mongo:7').start(),
  ]);

  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.MONGO_URL = `${mongo.getConnectionString()}/squad_of_champions_test?directConnection=true`;
  process.env.REDIS_URL ??= 'redis://localhost:6379';
  process.env.JWT_ACCESS_SECRET ??= 'test-only-secret-that-is-at-least-32-characters';
  process.env.LOG_LEVEL = 'silent';

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { env: process.env, stdio: 'ignore' });
  await seedCharacters();

  return async (): Promise<void> => {
    await Promise.all([postgres.stop(), mongo.stop()]);
  };
}
