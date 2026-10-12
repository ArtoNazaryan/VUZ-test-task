export function toSocketUrl(apiUrl: string): string {
  return new URL(apiUrl).origin;
}
