import type { ISquad, ISquadSummary } from '@/entities/squad/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { apiErrorResponse } from '@/shared/lib/test/api-responses.ts';
import { http, type HttpHandler, HttpResponse } from 'msw';

const TIMESTAMP = '2026-10-12T10:00:00.000Z';
const ABILITIES = ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'];

export interface ISquadsApiMock {
  handlers: HttpHandler[];
  squads: ISquadSummary[];
  createdNames: string[];
}

function toSquad(summary: ISquadSummary): ISquad {
  return {
    id: summary.id,
    name: summary.name,
    characters: [],
    stats: { memberCount: 0, abilities: ABILITIES.map((name) => ({ name, average: null })) },
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  };
}

function readName(body: unknown): string {
  return typeof body === 'object' &&
    body !== null &&
    'name' in body &&
    typeof body.name === 'string'
    ? body.name
    : '';
}

export function makeSquadSummary(id: string, name: string): ISquadSummary {
  return { id, name, memberCount: 0, createdAt: TIMESTAMP, updatedAt: TIMESTAMP };
}

export function createSquadsApiMock(initialSquads: ISquadSummary[] = []): ISquadsApiMock {
  const mock: ISquadsApiMock = { handlers: [], squads: [...initialSquads], createdNames: [] };
  const nameTaken = (): Response =>
    apiErrorResponse(409, 'SQUAD_NAME_TAKEN', 'You already have a squad with this name');

  mock.handlers = [
    http.get(`${API_URL}/squads`, () => HttpResponse.json(mock.squads)),
    http.get(`${API_URL}/squads/:id`, ({ params }) => {
      const squad = mock.squads.find((item) => item.id === params.id);

      return squad
        ? HttpResponse.json(toSquad(squad))
        : apiErrorResponse(404, 'NOT_FOUND', 'Squad not found');
    }),
    http.post(`${API_URL}/squads`, async ({ request }) => {
      const name = readName(await request.json());

      if (mock.squads.some((squad) => squad.name === name)) {
        return nameTaken();
      }

      const squad = makeSquadSummary(`squad-${String(mock.squads.length + 1)}`, name);
      mock.squads.push(squad);
      mock.createdNames.push(name);

      return HttpResponse.json(toSquad(squad), { status: 201 });
    }),
    http.patch(`${API_URL}/squads/:id`, async ({ params, request }) => {
      const name = readName(await request.json());
      const squad = mock.squads.find((item) => item.id === params.id);

      if (!squad) {
        return apiErrorResponse(404, 'NOT_FOUND', 'Squad not found');
      }

      if (mock.squads.some((item) => item.name === name && item.id !== squad.id)) {
        return nameTaken();
      }

      squad.name = name;

      return HttpResponse.json(toSquad(squad));
    }),
    http.delete(`${API_URL}/squads/:id`, ({ params }) => {
      mock.squads = mock.squads.filter((item) => item.id !== params.id);

      return new HttpResponse(null, { status: 204 });
    }),
  ];

  return mock;
}
