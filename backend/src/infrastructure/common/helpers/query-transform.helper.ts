export function toStringList(value: unknown): unknown {
  const parts = Array.isArray(value) ? value : [value];

  if (!parts.every((part) => typeof part === 'string')) {
    return value;
  }

  const items = parts
    .flatMap((part) => part.split(','))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : undefined;
}

export function toTrimmedString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}
