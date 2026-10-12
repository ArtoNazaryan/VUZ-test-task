import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { SessionStatus } from '@/entities/session/index.ts';
import { RegisterForm } from '@/features/register-form/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { apiErrorResponse } from '@/shared/lib/test/api-responses.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

async function fillAndSubmit(email: string, password: string): Promise<void> {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('RegisterForm', () => {
  it('shows the password rule as a hint before anything is typed', () => {
    renderWithStore(<RegisterForm />);

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('rejects a short password without calling the server', async () => {
    renderWithStore(<RegisterForm />);

    await fillAndSubmit('ken@example.com', 'short');

    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
  });

  it('shows EMAIL_TAKEN under the email field', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/register`, () =>
        apiErrorResponse(409, 'EMAIL_TAKEN', 'An account with this email already exists'),
      ),
    );
    renderWithStore(<RegisterForm />);

    await fillAndSubmit('ken@example.com', 'shoryuken-2026');

    expect(
      await screen.findByText('An account with this email already exists'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('starts the session after creating the account', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/register`, () => HttpResponse.json(makeAuthSession())),
    );
    const store = renderWithStore(<RegisterForm />);

    await fillAndSubmit('ken@example.com', 'shoryuken-2026');

    await vi.waitFor(() => {
      expect(store.getState().session.status).toBe(SessionStatus.AUTHENTICATED);
    });
  });
});
