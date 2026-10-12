import { loginFormSchema } from '@/features/login-form/model/login-form.schema.ts';

describe('loginFormSchema', () => {
  it('accepts an email and password and trims the email', () => {
    expect(loginFormSchema.parse({ email: '  ryu@example.com ', password: 'x' })).toEqual({
      email: 'ryu@example.com',
      password: 'x',
    });
  });

  it('rejects an invalid email', () => {
    expect(loginFormSchema.safeParse({ email: 'ryu', password: 'x' }).success).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(loginFormSchema.safeParse({ email: 'ryu@example.com', password: '' }).success).toBe(
      false,
    );
  });
});
