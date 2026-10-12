export function buildVersionKey(namespace: string): string {
  return `${namespace}:version`;
}

export function buildVersionedKey(namespace: string, version: number, suffix: string): string {
  return `${namespace}:v${version}:${suffix}`;
}

export function parseVersion(value: string | null): number {
  const version = Number(value);

  return Number.isInteger(version) && version > 0 ? version : 0;
}
