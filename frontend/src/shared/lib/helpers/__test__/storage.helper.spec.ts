import { readStoredValue, writeStoredValue } from '@/shared/lib/helpers/storage.helper.ts';

describe('storage helpers', () => {
  it('writes and reads a value', () => {
    writeStoredValue('key', 'value');

    expect(readStoredValue('key')).toBe('value');
  });

  it('returns null instead of throwing when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(readStoredValue('key')).toBeNull();
  });

  it('ignores write failures such as a full storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => {
      writeStoredValue('key', 'value');
    }).not.toThrow();
  });
});
