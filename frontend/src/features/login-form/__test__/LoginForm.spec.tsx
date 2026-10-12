import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { SessionStatus } from '@/entities/session/index.ts';
import { LoginForm } from '@/features/login-form/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { apiErrorResponse } from '@/shared/lib/test/api-responses.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';

async function fillAndSubmit(email: string, password: string): Promise<void> {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginForm', () => {
  it('shows field errors and sends nothing when the form is empty', async () => {
    let requests = 0;
    mswServer.use(
      http.post(`${API_URL}/auth/login`, () => {
        requests += 1;

        return HttpResponse.json(makeAuthSession());
      }),
    );
    renderWithStore(<LoginForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(requests).toBe(0);
  });

  it('starts the session after a successful login', async () => {
    mswServer.use(http.post(`${API_URL}/auth/login`, () => HttpResponse.json(makeAuthSession())));
    const store = renderWithStore(<LoginForm />);

    await fillAndSubmit('ryu@example.com', 'hadouken-2026');

    await vi.waitFor(() => {
      expect(store.getState().session.status).toBe(SessionStatus.AUTHENTICATED);
    });
    expect(store.getState().session.user?.email).toBe('ryu@example.com');
  });

  it('shows the server message for wrong credentials and stays logged out', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/login`, () =>
        apiErrorResponse(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect'),
      ),
    );
    const store = renderWithStore(<LoginForm />);

    await fillAndSubmit('ryu@example.com', 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect');
    expect(store.getState().session.status).toBe(SessionStatus.ANONYMOUS);
  });

  it('explains rate limiting in plain words', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/login`, () =>
        apiErrorResponse(429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later'),
      ),
    );
    renderWithStore(<LoginForm />);

    await fillAndSubmit('ryu@example.com', 'hadouken-2026');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts, please wait a minute and try again',
    );
  });

  it('disables the form while the request is in flight', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/login`, async () => {
        await delay(100);

        return HttpResponse.json(makeAuthSession());
      }),
    );
    renderWithStore(<LoginForm />);

    await fillAndSubmit('ryu@example.com', 'hadouken-2026');

    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
});
