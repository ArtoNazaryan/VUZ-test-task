import type { INestApplication } from '@nestjs/common';
import { io, type Socket } from 'socket.io-client';
import type { App } from 'supertest/types.js';

export async function listenOnRandomPort(app: INestApplication<App>): Promise<string> {
  await app.listen(0, '127.0.0.1');

  return app.getUrl();
}

export function connectSocket(url: string, token?: string): Promise<Socket> {
  const socket = io(url, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    reconnection: false,
    forceNew: true,
  });

  return new Promise((resolve, reject) => {
    socket.once('connect', () => {
      resolve(socket);
    });
    socket.once('connect_error', (error: Error) => {
      socket.close();
      reject(error);
    });
  });
}

export function waitForEvent(socket: Socket, event: string, timeoutMs = 3000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeoutMs);

    socket.once(event, (payload: unknown) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

export async function expectNoEvent(socket: Socket, event: string, waitMs = 400): Promise<boolean> {
  return new Promise((resolve) => {
    const onEvent = (): void => {
      clearTimeout(timer);
      resolve(false);
    };
    const timer = setTimeout(() => {
      socket.off(event, onEvent);
      resolve(true);
    }, waitMs);

    socket.once(event, onEvent);
  });
}
