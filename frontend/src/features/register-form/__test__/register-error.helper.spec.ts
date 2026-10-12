import { toRegisterErrorTarget } from '@/features/register-form/lib/register-error.helper.ts';

describe('toRegisterErrorTarget', () => {
  it('puts EMAIL_TAKEN under the email field', () => {
    expect(toRegisterErrorTarget({ statusCode: 409, error: 'EMAIL_TAKEN', message: 'x' })).toEqual({
      field: 'email',
      message: 'An account with this email already exists',
    });
  });

  it('shows other errors above the button', () => {
    expect(toRegisterErrorTarget({ statusCode: 0, error: 'NETWORK_ERROR', message: 'x' })).toEqual({
      field: null,
      message: 'Cannot reach the server, please check your connection',
    });
  });
});
