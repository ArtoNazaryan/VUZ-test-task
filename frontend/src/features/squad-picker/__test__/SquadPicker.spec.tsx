import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  createSquadsApiMock,
  makeSquadSummary,
} from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { buildActiveSquadStorageKey } from '@/entities/squad/index.ts';
import { SquadPicker } from '@/features/squad-picker/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const STORAGE_KEY = buildActiveSquadStorageKey('user-1');

const squadSelect = (): HTMLElement => screen.getByRole('combobox', { name: 'Squad' });

async function submitNameDialog(name: string, submitLabel: string): Promise<void> {
  const input = screen.getByRole('textbox', { name: 'Squad name' });

  await userEvent.clear(input);
  await userEvent.type(input, name);
  await userEvent.click(screen.getByRole('button', { name: submitLabel }));
}

describe('SquadPicker', () => {
  it('creates "My squad" once for a user without squads and selects it', async () => {
    const api = createSquadsApiMock();
    mswServer.use(...api.handlers);
    const store = renderWithStore(<SquadPicker />, true);

    expect(await screen.findByText('My squad (0/6)')).toBeInTheDocument();
    expect(api.createdNames).toEqual(['My squad']);
    expect(store.getState().activeSquad.squadId).toBe('squad-1');
  });

  it('selects the squad remembered for this user', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'squad-2');
    mswServer.use(
      ...createSquadsApiMock([
        makeSquadSummary('squad-1', 'Earthrealm'),
        makeSquadSummary('squad-2', 'Outworld'),
      ]).handlers,
    );
    renderWithStore(<SquadPicker />, true);

    expect(await screen.findByText('Outworld (0/6)')).toBeInTheDocument();
  });

  it('falls back to the first squad when the remembered one was deleted', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'deleted-squad');
    mswServer.use(...createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')]).handlers);
    renderWithStore(<SquadPicker />, true);

    expect(await screen.findByText('Earthrealm (0/6)')).toBeInTheDocument();
  });

  it('remembers the squad the user picks', async () => {
    mswServer.use(
      ...createSquadsApiMock([
        makeSquadSummary('squad-1', 'Earthrealm'),
        makeSquadSummary('squad-2', 'Outworld'),
      ]).handlers,
    );
    renderWithStore(<SquadPicker />, true);

    await userEvent.click(await screen.findByRole('combobox', { name: 'Squad' }));
    await userEvent.click(screen.getByRole('option', { name: 'Outworld (0/6)' }));

    expect(squadSelect()).toHaveTextContent('Outworld (0/6)');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('squad-2');
  });

  it('creates a new squad from the dialog and selects it', async () => {
    mswServer.use(...createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')]).handlers);
    renderWithStore(<SquadPicker />, true);

    await userEvent.click(await screen.findByRole('button', { name: 'New squad' }));
    await submitNameDialog('Outworld invaders', 'Create');

    expect(await screen.findByText('Outworld invaders (0/6)')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a duplicate name error under the name field', async () => {
    mswServer.use(...createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')]).handlers);
    renderWithStore(<SquadPicker />, true);

    await userEvent.click(await screen.findByRole('button', { name: 'New squad' }));
    await submitNameDialog('Earthrealm', 'Create');

    expect(await screen.findByText('You already have a squad with this name')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renames the selected squad', async () => {
    mswServer.use(...createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')]).handlers);
    renderWithStore(<SquadPicker />, true);

    await userEvent.click(await screen.findByRole('button', { name: 'Rename squad' }));
    await submitNameDialog('Netherrealm', 'Save');

    expect(await screen.findByText('Netherrealm (0/6)')).toBeInTheDocument();
  });

  it('deletes the selected squad after confirming and selects another one', async () => {
    mswServer.use(
      ...createSquadsApiMock([
        makeSquadSummary('squad-1', 'Earthrealm'),
        makeSquadSummary('squad-2', 'Outworld'),
      ]).handlers,
    );
    renderWithStore(<SquadPicker />, true);

    await userEvent.click(await screen.findByRole('button', { name: 'Delete squad' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Outworld (0/6)')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
