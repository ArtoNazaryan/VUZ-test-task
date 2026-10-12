import { registerFormSchema } from '@/features/register-form/model/register-form.schema.ts';

describe('registerFormSchema', () => {
  it('accepts a valid email and a password of 8 characters', () => {
    expect(
      registerFormSchema.safeParse({ email: 'ken@example.com', password: '12345678' }).success,
    ).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerFormSchema.safeParse({ email: 'ken@example.com', password: '1234567' });

    expect(result.error?.issues[0]?.message).toBe('Use at least 8 characters');
  });
});
