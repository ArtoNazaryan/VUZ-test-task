import { HttpResponse } from 'msw';

export function apiErrorResponse(statusCode: number, error: string, message: string): Response {
  return HttpResponse.json(
    { statusCode, error, message, requestId: 'test' },
    { status: statusCode },
  );
}
