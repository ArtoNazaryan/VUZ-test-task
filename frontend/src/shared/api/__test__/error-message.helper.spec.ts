import { getErrorMessage } from '@/shared/api/helpers/error-message.helper.ts';

describe('getErrorMessage', () => {
  it('explains rate limiting in plain words', () => {
    expect(
      getErrorMessage({
        statusCode: 429,
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many requests',
      }),
    ).toBe('Too many attempts, please wait a minute and try again');
  });

  it('uses the server message for other errors', () => {
    expect(
      getErrorMessage({
        statusCode: 401,
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      }),
    ).toBe('Email or password is incorrect');
  });
});
