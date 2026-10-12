import type { IHttpExceptionBody } from '@infrastructure/interfaces/common/error-response.interfaces.js';

export function isHttpExceptionBody(value: unknown): value is IHttpExceptionBody {
  if (typeof value !== 'object' || value === null || !('message' in value)) {
    return false;
  }

  const { message } = value;

  return (
    typeof message === 'string' ||
    (Array.isArray(message) && message.every((item) => typeof item === 'string'))
  );
}
