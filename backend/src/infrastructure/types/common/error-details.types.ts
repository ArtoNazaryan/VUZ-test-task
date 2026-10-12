import type { IValidationIssue } from '@infrastructure/interfaces/common/error-response.interfaces.js';

export type TErrorDetails = readonly IValidationIssue[] | Readonly<Record<string, unknown>>;
