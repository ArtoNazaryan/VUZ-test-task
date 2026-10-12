import { capitalize } from '@/shared/lib/helpers/text.helper.ts';

describe('capitalize', () => {
  it('upper-cases the first letter only', () => {
    expect(capitalize('grapple')).toBe('Grapple');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});
