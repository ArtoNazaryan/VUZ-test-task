import type { ICharacter } from '@/entities/character/@x/squad.ts';
import type { ISquad, ISquadSummary } from '@/entities/squad/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { apiErrorResponse } from '@/shared/lib/test/api-responses.ts';
import { http, type HttpHandler, HttpResponse } from 'msw';

const TIMESTAMP = '2026-10-12T10:00:00.000Z';
const ABILITIES = ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'];

export interface IMockFailure {
  status: number;
  error: string;
  message: string;
}

export interface ISquadsApiMock {
  handlers: HttpHandler[];
  squads: ISquadSummary[];
  members: Record<string, ICharacter[]>;
  createdNames: string[];
  failNextMemberChange: IMockFailure | null;
  catalogue: ICharacter[];
}

function averageOf(characters: ICharacter[], ability: string): number | null {
  const scores = characters.flatMap((character) =>
    character.abilities.filter((item) => item.name === ability).map((item) => item.score),
  );

  return scores.length > 0
    ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
    : null;
}

function readName(body: unknown): string {
  return typeof body === 'object' &&
    body !== null &&
    'name' in body &&
    typeof body.name === 'string'
    ? body.name
    : '';
}

export function makeSquadSummary(id: string, name: string, memberCount = 0): ISquadSummary {
  return { id, name, memberCount, createdAt: TIMESTAMP, updatedAt: TIMESTAMP };
}

export function createSquadsApiMock(
  initialSquads: ISquadSummary[] = [],
  initialMembers: Record<string, ICharacter[]> = {},
  catalogue: ICharacter[] = [],
): ISquadsApiMock {
  const mock: ISquadsApiMock = {
    handlers: [],
    squads: initialSquads.map((squad) => ({ ...squad })),
    members: { ...initialMembers },
    createdNames: [],
    failNextMemberChange: null,
    catalogue,
  };

  const toSquad = (summary: ISquadSummary): ISquad => {
    const characters = mock.members[summary.id] ?? [];

    return {
      id: summary.id,
      name: summary.name,
      characters,
      stats: {
        memberCount: characters.length,
        abilities: ABILITIES.map((name) => ({ name, average: averageOf(characters, name) })),
      },
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    };
  };
  const findSquad = (id: unknown): ISquadSummary | undefined =>
    mock.squads.find((squad) => squad.id === id);
  const notFound = (): Response => apiErrorResponse(404, 'NOT_FOUND', 'Squad not found');
  const nameTaken = (): Response =>
    apiErrorResponse(409, 'SQUAD_NAME_TAKEN', 'You already have a squad with this name');
  const takeFailure = (): Response | null => {
    const failure = mock.failNextMemberChange;
    mock.failNextMemberChange = null;

    return failure ? apiErrorResponse(failure.status, failure.error, failure.message) : null;
  };

  mock.handlers = [
    http.get(`${API_URL}/squads`, () =>
      HttpResponse.json(
        mock.squads.map((squad) => ({
          ...squad,
          memberCount: (mock.members[squad.id] ?? []).length,
        })),
      ),
    ),
    http.get(`${API_URL}/squads/:id`, ({ params }) => {
      const squad = findSquad(params.id);

      return squad ? HttpResponse.json(toSquad(squad)) : notFound();
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
      const squad = findSquad(params.id);

      if (!squad) {
        return notFound();
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
    http.post(`${API_URL}/squads/:id/characters/:characterId`, ({ params }) => {
      const squad = findSquad(params.id);

      if (!squad) {
        return notFound();
      }

      const failure = takeFailure();

      if (failure) {
        return failure;
      }

      const members = mock.members[squad.id] ?? [];
      const character = mock.catalogue.find((item) => String(item.id) === params.characterId);

      if (members.some((member) => String(member.id) === params.characterId)) {
        return apiErrorResponse(
          409,
          'CHARACTER_ALREADY_IN_SQUAD',
          'A character cannot appear twice in the same squad',
        );
      }

      if (members.length >= 6) {
        return apiErrorResponse(422, 'SQUAD_FULL', 'A squad cannot have more than 6 characters');
      }

      if (!character) {
        return apiErrorResponse(422, 'CHARACTER_NOT_FOUND', 'One or more characters do not exist');
      }

      mock.members[squad.id] = [...members, character];

      return HttpResponse.json(toSquad(squad));
    }),
    http.delete(`${API_URL}/squads/:id/characters/:characterId`, ({ params }) => {
      const squad = findSquad(params.id);

      if (!squad) {
        return notFound();
      }

      const failure = takeFailure();

      if (failure) {
        return failure;
      }

      mock.members[squad.id] = (mock.members[squad.id] ?? []).filter(
        (character) => String(character.id) !== params.characterId,
      );

      return HttpResponse.json(toSquad(squad));
    }),
  ];

  return mock;
}
