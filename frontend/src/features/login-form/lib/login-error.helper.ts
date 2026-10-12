import type { TLoginField } from '@/features/login-form/model/login-form.types.ts';
import { getErrorMessage, type IApiError } from '@/shared/api/index.ts';
import type { IFormErrorTarget } from '@/shared/lib/types/form.interfaces.ts';

export function toLoginErrorTarget(error: IApiError): IFormErrorTarget<TLoginField> {
  return { field: null, message: getErrorMessage(error) };
}
