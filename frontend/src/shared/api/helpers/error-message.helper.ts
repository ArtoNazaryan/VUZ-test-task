import type { IApiError } from '@/shared/api/types/api.interfaces.ts';

const FRIENDLY_MESSAGES: Readonly<Record<string, string>> = {
  TOO_MANY_REQUESTS: 'Too many attempts, please wait a minute and try again',
  NETWORK_ERROR: 'Cannot reach the server, please check your connection',
  INTERNAL_ERROR: 'Something went wrong on our side, please try again',
};

export function getErrorMessage(error: IApiError): string {
  return FRIENDLY_MESSAGES[error.error] ?? error.message;
}
