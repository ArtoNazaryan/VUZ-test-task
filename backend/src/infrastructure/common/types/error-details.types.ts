import type { IValidationIssue } from '@infrastructure/common/interfaces/error-response.interfaces.js';

export type TErrorDetails = readonly IValidationIssue[] | Readonly<Record<string, unknown>>;
