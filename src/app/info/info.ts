import type { City, Country } from '@prisma/client';

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

// Returns the slug of every capital, keyed by capital id
// A few capitals share a name (Kingston and Victoria), so the first one (by country id) gets the plain name,
// and the others get their country appended, e.g. `kingston-norfolk-island`
export function getCapitalSlugs(
  combinedCountries: { capital: City; country: Country }[]
): Map<number, string> {
  const slugs: Map<number, string> = new Map();
  const taken: Set<string> = new Set();

  [...combinedCountries]
    .sort((a, b) => a.country.id - b.country.id)
    .forEach(({ capital, country }) => {
      let slug: string = createSlug(capital.englishName)!;
      if (taken.has(slug))
        slug = `${slug}-${createSlug(country.englishShortName)}`;
      taken.add(slug);
      slugs.set(capital.id, slug);
    });

  return slugs;
}
