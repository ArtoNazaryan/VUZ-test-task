import { isApiErrorBody, toApiError } from '@/shared/api/helpers/api-error.helper.ts';

describe('toApiError', () => {
  it('returns the server error body as it is', () => {
    const body = {
      statusCode: 422,
      error: 'SQUAD_FULL',
      message: 'A squad cannot have more than 6 characters',
      details: { limit: 6, requested: 7 },
    };

    expect(toApiError({ status: 422, data: body })).toEqual(body);
  });

  it('turns a failed network request into NETWORK_ERROR', () => {
    expect(
      toApiError({ status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }),
    ).toMatchObject({ error: 'NETWORK_ERROR', statusCode: 0 });
  });

  it('keeps the HTTP status when the body is not an API error', () => {
    expect(toApiError({ status: 502, data: '<html>Bad gateway</html>' })).toMatchObject({
      statusCode: 502,
      error: 'UNKNOWN_ERROR',
    });
  });

  it('handles values that are not errors at all', () => {
    expect(toApiError(undefined)).toMatchObject({ error: 'UNKNOWN_ERROR' });
  });
});

describe('isApiErrorBody', () => {
  it('rejects an object without an error code', () => {
    expect(isApiErrorBody({ statusCode: 400, message: 'Bad' })).toBe(false);
  });
});
