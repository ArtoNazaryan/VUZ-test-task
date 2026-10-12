import { DUMMY_PASSWORD_HASH } from '@app/auth/constants/auth.constants.js';
import { hashPassword, verifyPassword } from '@app/auth/helpers/password.helper.js';
import { describe, expect, it } from 'vitest';

describe('password helpers', () => {
  it('hashes with argon2id and the configured cost settings', async () => {
    await expect(hashPassword('hadouken-2026')).resolves.toMatch(
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/,
    );
  });

  it('never returns the plain password', async () => {
    await expect(hashPassword('hadouken-2026')).resolves.not.toContain('hadouken-2026');
  });

  it('verifies the correct password', async () => {
    const passwordHash = await hashPassword('hadouken-2026');

    await expect(verifyPassword(passwordHash, 'hadouken-2026')).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const passwordHash = await hashPassword('hadouken-2026');

    await expect(verifyPassword(passwordHash, 'shoryuken-2026')).resolves.toBe(false);
  });

  it('uses the same cost settings for the dummy hash as for real hashes', () => {
    expect(DUMMY_PASSWORD_HASH).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });
});
