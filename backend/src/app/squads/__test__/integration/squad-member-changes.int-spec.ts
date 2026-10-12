import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface ISquadBody {
  id: string;
  characters: { id: number }[];
  stats: { memberCount: number };
}

const EMAIL_DOMAIN = '@squad-changes-int.test';

describe('Adding and removing squad members', () => {
  let app: INestApplication<App>;
  let owner: ITestUser;
  let stranger: ITestUser;
  let squadCount = 0;

  beforeAll(async () => {
    app = await createIntegrationApp();
    owner = await registerTestUser(app, `owner${EMAIL_DOMAIN}`);
    stranger = await registerTestUser(app, `stranger${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  async function createSquad(characterIds: number[]): Promise<string> {
    squadCount += 1;

    const response = await request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: `Squad ${squadCount}`, characterIds });

    return (response.body as ISquadBody).id;
  }

  const addMember = (squadId: string, characterId: number, user = owner): request.Test =>
    request(app.getHttpServer())
      .post(`/api/v1/squads/${squadId}/characters/${characterId}`)
      .set('Authorization', user.authorization);

  const removeMember = (squadId: string, characterId: number, user = owner): request.Test =>
    request(app.getHttpServer())
      .delete(`/api/v1/squads/${squadId}/characters/${characterId}`)
      .set('Authorization', user.authorization);

  async function memberIds(squadId: string): Promise<number[]> {
    const members = await app.get(PrismaService).squadMember.findMany({
      where: { squadId },
      select: { characterId: true },
    });

    return members.map((member) => member.characterId);
  }

  it('adds a character and returns the updated squad with stats', async () => {
    const squadId = await createSquad([1]);

    const response = await addMember(squadId, 25);
    const body = response.body as ISquadBody;

    expect(response.status).toBe(200);
    expect(body.characters.map((character) => character.id)).toEqual([1, 25]);
    expect(body.stats.memberCount).toBe(2);
  });

  it('rejects a seventh character with 422 SQUAD_FULL', async () => {
    const squadId = await createSquad([1, 2, 3, 4, 5, 6]);

    const response = await addMember(squadId, 7);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ error: ErrorCode.SquadFull });
  });

  it('rejects a character already in the squad with 409', async () => {
    const squadId = await createSquad([1]);

    const response = await addMember(squadId, 1);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: ErrorCode.CharacterAlreadyInSquad });
  });

  it('rejects an unknown character with 422 CHARACTER_NOT_FOUND', async () => {
    const squadId = await createSquad([]);

    const response = await addMember(squadId, 9999);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ error: ErrorCode.CharacterNotFound });
  });

  it('returns 404 when adding to or removing from a squad of another user', async () => {
    const squadId = await createSquad([1]);

    expect((await addMember(squadId, 25, stranger)).status).toBe(404);
    expect((await removeMember(squadId, 1, stranger)).status).toBe(404);
    await expect(memberIds(squadId)).resolves.toEqual([1]);
  });

  it('removes a character and is idempotent when removing it again', async () => {
    const squadId = await createSquad([1, 25]);

    const first = await removeMember(squadId, 25);
    const second = await removeMember(squadId, 25);

    expect(first.status).toBe(200);
    expect((first.body as ISquadBody).characters.map((character) => character.id)).toEqual([1]);
    expect(second.status).toBe(200);
  });

  it('never exceeds 6 members when 8 different characters are added at the same time', async () => {
    const squadId = await createSquad([1, 2, 3, 4]);

    const responses = await Promise.all(
      [10, 11, 12, 13, 14, 15, 16, 17].map((characterId) => addMember(squadId, characterId)),
    );
    const statuses = responses.map((response) => response.status);

    expect(statuses.filter((status) => status === 200)).toHaveLength(2);
    expect(statuses.filter((status) => status === 422)).toHaveLength(6);
    expect(
      responses
        .filter((response) => response.status === 422)
        .map((response) => (response.body as { error: string }).error),
    ).toEqual(Array.from({ length: 6 }, () => 'SQUAD_FULL'));
    await expect(memberIds(squadId)).resolves.toHaveLength(6);
  });

  it('adds the same character only once when it is added 5 times at the same time', async () => {
    const squadId = await createSquad([1]);

    const responses = await Promise.all(Array.from({ length: 5 }, () => addMember(squadId, 25)));
    const statuses = responses.map((response) => response.status);

    expect(statuses.filter((status) => status === 200)).toHaveLength(1);
    expect(statuses.filter((status) => status === 409)).toHaveLength(4);
    await expect(memberIds(squadId)).resolves.toEqual(expect.arrayContaining([1, 25]));
    await expect(memberIds(squadId)).resolves.toHaveLength(2);
  });

  it('emits member events for successful changes only', async () => {
    const squadId = await createSquad([1, 2, 3, 4, 5, 6]);
    const received: string[] = [];
    const eventEmitter = app.get(EventEmitter2);
    const record = (event: string) => (): void => {
      received.push(event);
    };
    const onAdded = record(SquadEvent.MemberAdded);
    const onRemoved = record(SquadEvent.MemberRemoved);

    eventEmitter.on(SquadEvent.MemberAdded, onAdded);
    eventEmitter.on(SquadEvent.MemberRemoved, onRemoved);

    await addMember(squadId, 7);
    await removeMember(squadId, 6);
    await addMember(squadId, 7);
    await removeMember(squadId, 6);

    eventEmitter.off(SquadEvent.MemberAdded, onAdded);
    eventEmitter.off(SquadEvent.MemberRemoved, onRemoved);

    expect(received).toEqual([SquadEvent.MemberRemoved, SquadEvent.MemberAdded]);
  });
});
