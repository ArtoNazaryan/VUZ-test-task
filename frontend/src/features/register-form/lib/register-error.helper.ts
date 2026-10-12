import type { TRegisterField } from '@/features/register-form/model/register-form.types.ts';
import { getErrorMessage, type IApiError } from '@/shared/api/index.ts';
import type { IFormErrorTarget } from '@/shared/lib/types/form.interfaces.ts';

export function toRegisterErrorTarget(error: IApiError): IFormErrorTarget<TRegisterField> {
  if (error.error === 'EMAIL_TAKEN') {
    return { field: 'email', message: 'An account with this email already exists' };
  }

  return { field: null, message: getErrorMessage(error) };
}
