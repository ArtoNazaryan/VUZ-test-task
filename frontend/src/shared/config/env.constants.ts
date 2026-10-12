const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

const configuredApiUrl: unknown = import.meta.env.VITE_API_URL;

export const API_URL =
  typeof configuredApiUrl === 'string' && configuredApiUrl.length > 0
    ? configuredApiUrl
    : DEFAULT_API_URL;
