export interface ISquadEventDetails {
  name?: string;
  characterIds?: number[];
}

export interface ISquadEventPayload {
  squadId: string;
  userId: string;
  occurredAt: Date;
  details?: ISquadEventDetails;
}

export interface ISquadMemberEventPayload extends ISquadEventPayload {
  characterId: number;
}
