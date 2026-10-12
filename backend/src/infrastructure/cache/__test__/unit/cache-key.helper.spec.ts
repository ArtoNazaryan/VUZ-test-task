import {
  buildVersionedKey,
  buildVersionKey,
  parseVersion,
} from '@infrastructure/cache/helpers/cache-key.helper.js';
import { describe, expect, it } from 'vitest';

describe('cache key helpers', () => {
  it('builds the version key of a namespace', () => {
    expect(buildVersionKey('characters')).toBe('characters:version');
  });

  it('builds a key that contains the namespace version', () => {
    expect(buildVersionedKey('characters', 3, 'item:1')).toBe('characters:v3:item:1');
  });

  it('parses a stored version number', () => {
    expect(parseVersion('7')).toBe(7);
  });

  it('treats a missing or broken version as 0', () => {
    expect(parseVersion(null)).toBe(0);
    expect(parseVersion('abc')).toBe(0);
  });
});
