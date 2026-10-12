import { getInitials } from '@/entities/character/lib/character-display.helper.ts';

describe('getInitials', () => {
  it('uses the first letters of the first two words', () => {
    expect(getInitials('Cassie Cage')).toBe('CC');
    expect(getInitials('Dr. Mario')).toBe('DM');
  });

  it('skips words that start with a symbol', () => {
    expect(getInitials('Android 21 (Lab Coat)')).toBe('A2');
  });
});
