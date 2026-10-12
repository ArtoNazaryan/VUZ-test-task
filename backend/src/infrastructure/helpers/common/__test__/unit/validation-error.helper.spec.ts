import { flattenValidationErrors } from '@infrastructure/helpers/common/validation-error.helper.js';
import type { ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('flattenValidationErrors', () => {
  it('returns one issue per property with its constraint messages', () => {
    const errors: ValidationError[] = [
      { property: 'name', constraints: { isString: 'name must be a string' }, children: [] },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'name', messages: ['name must be a string'] },
    ]);
  });

  it('builds dotted paths for nested and array children', () => {
    const errors: ValidationError[] = [
      {
        property: 'members',
        children: [{ property: '0', constraints: { isInt: '0 must be an integer' }, children: [] }],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'members.0', messages: ['0 must be an integer'] },
    ]);
  });

  it('returns an empty list when there are no errors', () => {
    expect(flattenValidationErrors([])).toEqual([]);
  });
});
