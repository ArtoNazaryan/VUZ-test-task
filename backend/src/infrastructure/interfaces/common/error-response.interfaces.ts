import type { ErrorCode } from '@infrastructure/enums/common/error-code.enum.js';
import type { TErrorDetails } from '@infrastructure/types/common/error-details.types.js';

export interface IValidationIssue {
  field: string;
  messages: string[];
}

export interface IErrorResponse {
  statusCode: number;
  error: ErrorCode;
  message: string;
  details?: TErrorDetails;
  requestId?: string;
}

export interface IHttpExceptionBody {
  message: string | string[];
}
