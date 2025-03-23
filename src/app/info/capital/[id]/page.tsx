import { getCapitals, getCombinedCountries } from '@/api';
import CityInfo from '@/components/CityInfo';
import { createSlug, getStaticInfoIDParams, SlugGenerator } from '../../info';
import { City } from '@prisma/client';
import { CombinedCountry } from '@/db';

const capitalSlugGenerators: SlugGenerator<City>[] = [
  (city) => createSlug(city.englishName), // City english name
];

export async function generateStaticParams() {
  const capitals = await getCapitals('all', 'World');
  return getStaticInfoIDParams(capitals, capitalSlugGenerators);
}

async function getCombinedCountryFromCapital(
  slug: string
): Promise<CombinedCountry | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  const encodedSlug = createSlug(decodedSlug);

  const combinedCountries = await getCombinedCountries('all', 'World');

  const capital = combinedCountries.find((cc) =>
    capitalSlugGenerators.some(
      (generator) => generator(cc.capital) === encodedSlug
    )
  );

  return capital ?? undefined;
}

export default async function CapitalPage({
  params,
}: {
  params: { id: string };
}) {
  const combinedCountry: CombinedCountry | undefined =
    await getCombinedCountryFromCapital(params.id);
  return (
    <CityInfo
      city={combinedCountry?.capital}
      country={combinedCountry?.country}
    />
  );
}
