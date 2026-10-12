import type { IValidationIssue } from '@infrastructure/interfaces/common/error-response.interfaces.js';
import type { ValidationError } from 'class-validator';

export function flattenValidationErrors(
  errors: readonly ValidationError[],
  parentPath = '',
): IValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const ownIssues = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];

    return [...ownIssues, ...flattenValidationErrors(error.children ?? [], field)];
  });
}
