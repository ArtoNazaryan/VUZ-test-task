import { normalizeEmail } from '@app/users/helpers/email.helper.js';
import { describe, expect, it } from 'vitest';

describe('normalizeEmail', () => {
  it('trims and lower-cases the email', () => {
    expect(normalizeEmail('  Ryu@Example.COM ')).toBe('ryu@example.com');
  });
});
