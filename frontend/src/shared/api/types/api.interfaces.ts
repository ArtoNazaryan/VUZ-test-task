export interface IApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

export interface IAuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface IAuthSessionPayload {
  accessToken: string;
  user: IAuthUser;
}
