import type { ArgumentsHost } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Request } from 'express';
import { vi, type Mock } from 'vitest';

export interface IResponseMock {
  status: Mock<(code: number) => IResponseMock>;
  json: Mock<(body: unknown) => IResponseMock>;
}

export function createResponseMock(): IResponseMock {
  const response: IResponseMock = {
    status: vi.fn<(code: number) => IResponseMock>(),
    json: vi.fn<(body: unknown) => IResponseMock>(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

export function createHttpArgumentsHost(
  request: Partial<Request>,
  response: IResponseMock,
): ArgumentsHost {
  return new ExecutionContextHost([request, response]);
}
