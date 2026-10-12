import { isRecord } from '@/shared/lib/helpers/object.helper.ts';
import type { IApiError } from '@/shared/api/types/api.interfaces.ts';

const NETWORK_ERROR: IApiError = {
  statusCode: 0,
  error: 'NETWORK_ERROR',
  message: 'Cannot reach the server, please check your connection',
};

const UNKNOWN_ERROR: IApiError = {
  statusCode: 0,
  error: 'UNKNOWN_ERROR',
  message: 'Something went wrong, please try again',
};

export function isApiErrorBody(value: unknown): value is IApiError {
  return (
    isRecord(value) &&
    typeof value.statusCode === 'number' &&
    typeof value.error === 'string' &&
    typeof value.message === 'string'
  );
}

export function toApiError(error: unknown): IApiError {
  if (!isRecord(error)) {
    return UNKNOWN_ERROR;
  }

  if (isApiErrorBody(error.data)) {
    return error.data;
  }

  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return NETWORK_ERROR;
  }

  return typeof error.status === 'number'
    ? { ...UNKNOWN_ERROR, statusCode: error.status }
    : UNKNOWN_ERROR;
}
