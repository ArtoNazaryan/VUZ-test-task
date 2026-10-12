import type { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { TErrorDetails } from '@infrastructure/common/types/error-details.types.js';

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
