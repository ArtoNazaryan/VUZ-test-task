import { RealtimeGateway } from '@app/realtime/gateways/realtime.gateway.js';
import { SquadEventsListener } from '@app/realtime/listeners/squad-events.listener.js';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SquadEventsListener', () => {
  let listener: SquadEventsListener;
  const gateway = {
    emitToUser: vi.fn<(userId: string, event: string, payload: unknown) => void>(),
  };
  const occurredAt = new Date('2026-10-12T10:00:00.000Z');

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SquadEventsListener, { provide: RealtimeGateway, useValue: gateway }],
    }).compile();

    listener = moduleRef.get(SquadEventsListener);
  });

  it('tells only the owner that a character was added', () => {
    listener.handleMemberAdded({
      squadId: 'squad-1',
      userId: 'user-1',
      characterId: 25,
      occurredAt,
    });

    expect(gateway.emitToUser).toHaveBeenCalledWith('user-1', 'squad:changed', {
      squadId: 'squad-1',
      change: 'member-added',
      characterId: 25,
      occurredAt: '2026-10-12T10:00:00.000Z',
    });
  });

  it('tells the owner that a squad was deleted', () => {
    listener.handleDeleted({ squadId: 'squad-1', userId: 'user-1', occurredAt });

    expect(gateway.emitToUser).toHaveBeenCalledWith(
      'user-1',
      'squad:changed',
      expect.objectContaining({ change: 'deleted' }),
    );
  });
});
