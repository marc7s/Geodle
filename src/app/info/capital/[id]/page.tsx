import { getCombinedCountries } from '@/api';
import CityInfo from '@/components/CityInfo';
import { createSlug, getCapitalSlugs, InfoParam } from '../../info';
import { CombinedCountry } from '@/db';

export async function generateStaticParams(): Promise<InfoParam[]> {
  const combinedCountries = await getCombinedCountries('all', 'World');
  return Array.from(getCapitalSlugs(combinedCountries).values()).map(
    (slug) => ({ id: slug })
  );
}

async function getCombinedCountryFromCapital(
  slug: string
): Promise<CombinedCountry | undefined> {
  const encodedSlug = createSlug(decodeURIComponent(slug));

  const combinedCountries = await getCombinedCountries('all', 'World');
  const capitalSlugs = getCapitalSlugs(combinedCountries);

  return combinedCountries.find(
    (cc) => capitalSlugs.get(cc.capital.id) === encodedSlug
  );
}

export default async function CapitalPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const combinedCountry: CombinedCountry | undefined =
    await getCombinedCountryFromCapital(params.id);
  return (
    <CityInfo
      city={combinedCountry?.capital}
      country={combinedCountry?.country}
    />
  );
}
