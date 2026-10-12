import { getErrorMessage, type IApiError } from '@/shared/api/index.ts';
import type { IFormErrorTarget } from '@/shared/lib/types/form.interfaces.ts';

export function toSquadNameErrorTarget(error: IApiError): IFormErrorTarget<'name'> {
  if (error.error === 'SQUAD_NAME_TAKEN') {
    return { field: 'name', message: 'You already have a squad with this name' };
  }

  return { field: null, message: getErrorMessage(error) };
}
