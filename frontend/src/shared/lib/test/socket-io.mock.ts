import type { ManagerOptions, SocketOptions } from 'socket.io-client';

type TListener = (...args: unknown[]) => void;
type TSocketOptions = Partial<ManagerOptions & SocketOptions>;

const createdSockets: FakeSocket[] = [];

export class FakeSocket {
  readonly url: string;
  readonly options: TSocketOptions;
  connectCalls = 0;
  isDisconnected = false;
  private readonly listeners = new Map<string, TListener[]>();

  constructor(url: string, options: TSocketOptions = {}) {
    this.url = url;
    this.options = options;
    createdSockets.push(this);
  }

  on(event: string, listener: TListener): this {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);

    return this;
  }

  connect(): this {
    this.connectCalls += 1;

    return this;
  }

  disconnect(): this {
    this.isDisconnected = true;

    return this;
  }

  serverEmit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((listener) => {
      listener(...args);
    });
  }

  readAuth(): Promise<unknown> {
    const { auth } = this.options;

    return new Promise((resolve) => {
      if (typeof auth === 'function') {
        auth(resolve);
      } else {
        resolve(auth);
      }
    });
  }
}

export function createFakeSocket(url: string, options?: TSocketOptions): FakeSocket {
  return new FakeSocket(url, options);
}

export function getCreatedSockets(): FakeSocket[] {
  return createdSockets;
}

export function resetCreatedSockets(): void {
  createdSockets.length = 0;
}
