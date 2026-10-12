export function orderByIds<T extends { id: number }>(items: T[], ids: number[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));

  return ids.flatMap((id) => {
    const item = byId.get(id);

    return item ? [item] : [];
  });
}
