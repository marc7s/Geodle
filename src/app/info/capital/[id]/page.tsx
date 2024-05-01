import { CombinedCountry, getCapitals, getCombinedCountries } from '@/api';
import CityInfo from '@/components/CityInfo';
import { createSlug, getStaticInfoIDParams } from '../../info';
import { City } from '@prisma/client';

export async function generateStaticParams() {
  const capitals = await getCapitals('World');
  return getStaticInfoIDParams(capitals, (c: City) => [
    c.id.toString(),
    c.englishName,
  ]);
}

async function getCombinedCountryFromCapital(
  slug: string
): Promise<CombinedCountry | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  const capitalID: number = Number.parseInt(decodedSlug) || -1;
  const capitalName: string | undefined = createSlug(decodedSlug);

  const combinedCountries = await getCombinedCountries('World');

  const capital = combinedCountries.find(
    (cc) =>
      cc.capital.id === capitalID ||
      createSlug(cc.capital.englishName) === capitalName
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
