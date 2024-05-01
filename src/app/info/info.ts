export interface InfoParam {
  id: string;
}

export function createSlug(id: string | undefined | null): string | undefined {
  return id
    ?.toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replaceAll(' ', '-')
    .replaceAll(/[()']/g, '');
}

export function getStaticInfoIDParams<T>(
  data: T[],
  idExtractor: (_: T) => (string | null)[]
): InfoParam[] {
  const ids: string[] = data
    .map((entry) => idExtractor(entry).map(createSlug))
    .flatMap((items) => {
      const filteredItems = items.flatMap((item) => (item ? [item] : []));
      return filteredItems;
    });

  return ids
    .filter((id, i) => ids.indexOf(id) === i)
    .map((id) => {
      return { id: id };
    });
}
