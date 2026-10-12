import {
  toStringList,
  toTrimmedString,
} from '@infrastructure/common/helpers/query-transform.helper.js';
import { describe, expect, it } from 'vitest';

describe('toStringList', () => {
  it('splits a comma separated value and trims each item', () => {
    expect(toStringList(' ninja , robot ')).toEqual(['ninja', 'robot']);
  });

  it('merges repeated query parameters', () => {
    expect(toStringList(['ninja', 'robot,god'])).toEqual(['ninja', 'robot', 'god']);
  });

  it('returns undefined when nothing is left after trimming', () => {
    expect(toStringList(' , ')).toBeUndefined();
  });

  it('passes through values that are not strings so validation can reject them', () => {
    expect(toStringList({ nested: true })).toEqual({ nested: true });
  });
});

describe('toTrimmedString', () => {
  it('trims surrounding whitespace', () => {
    expect(toTrimmedString('  sub ')).toBe('sub');
  });

  it('returns undefined for a blank string', () => {
    expect(toTrimmedString('   ')).toBeUndefined();
  });

  it('passes through non string values', () => {
    expect(toTrimmedString(5)).toBe(5);
  });
});
