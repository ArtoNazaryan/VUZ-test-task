import { readRedirectPath } from '@/shared/lib/helpers/redirect.helper.ts';

describe('readRedirectPath', () => {
  it('returns the page the user originally asked for', () => {
    expect(readRedirectPath({ from: '/squads' })).toBe('/squads');
  });

  it('ignores a missing or malformed state', () => {
    expect(readRedirectPath(null)).toBeNull();
    expect(readRedirectPath({ from: 42 })).toBeNull();
  });

  it('refuses paths that would leave the app', () => {
    expect(readRedirectPath({ from: 'https://evil.test' })).toBeNull();
    expect(readRedirectPath({ from: '//evil.test' })).toBeNull();
  });
});
