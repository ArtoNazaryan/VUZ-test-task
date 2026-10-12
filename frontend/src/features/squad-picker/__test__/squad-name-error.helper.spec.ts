import { toSquadNameErrorTarget } from '@/features/squad-picker/lib/squad-name-error.helper.ts';

describe('toSquadNameErrorTarget', () => {
  it('shows a duplicate name under the name field', () => {
    expect(
      toSquadNameErrorTarget({ statusCode: 409, error: 'SQUAD_NAME_TAKEN', message: 'x' }),
    ).toEqual({ field: 'name', message: 'You already have a squad with this name' });
  });

  it('shows other errors in the dialog', () => {
    expect(
      toSquadNameErrorTarget({ statusCode: 429, error: 'TOO_MANY_REQUESTS', message: 'x' }),
    ).toEqual({ field: null, message: 'Too many attempts, please wait a minute and try again' });
  });
});
