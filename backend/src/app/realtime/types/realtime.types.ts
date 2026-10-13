import type { ISocketData } from '@app/realtime/interfaces/realtime.interfaces.js';
import type { DefaultEventsMap, Server, Socket } from 'socket.io';

export type TSquadChange = 'created' | 'updated' | 'deleted' | 'member-added' | 'member-removed';

export type TRealtimeServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  ISocketData
>;

export type TRealtimeSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  ISocketData
>;
