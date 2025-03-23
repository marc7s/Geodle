export interface InfoParam {
  id: string;
}

export type SlugGenerator<T> = (item: T) => string | undefined;

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
  slugGenerators: SlugGenerator<T>[]
): InfoParam[] {
  const ids: string[] = data
    .map((entry) => slugGenerators.map((generator) => generator(entry)))
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
