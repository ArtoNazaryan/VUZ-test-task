import { type INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly redisLogger = new Logger(RedisIoAdapter.name);
  private readonly redisClients: Redis[] = [];
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(
    app: INestApplicationContext,
    private readonly corsOrigins: string[],
  ) {
    super(app);
  }

  connectToRedis(redisUrl: string): void {
    const publisher = new Redis(redisUrl);
    const subscriber = publisher.duplicate();

    [publisher, subscriber].forEach((client) => {
      client.on('error', (error: Error) => {
        this.redisLogger.warn({ err: error }, '[RedisIoAdapter] Redis connection error');
      });
    });
    this.redisClients.push(publisher, subscriber);
    this.adapterConstructor = createAdapter(publisher, subscriber);
  }

  override createIOServer(port: number, options: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: this.corsOrigins, credentials: true },
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }

  override async close(server: Server): Promise<void> {
    await super.close(server);
    this.redisClients.forEach((client) => {
      client.disconnect();
    });
  }
}
