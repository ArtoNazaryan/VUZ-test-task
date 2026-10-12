export interface ISquadEventPayload {
  squadId: string;
  userId: string;
  occurredAt: Date;
}

export interface ISquadMemberEventPayload extends ISquadEventPayload {
  characterId: number;
}
