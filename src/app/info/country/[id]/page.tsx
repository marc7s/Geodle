import { getCountries } from '@/api';
import CountryInfo from '@/components/CountryInfo';
import { Country } from '@prisma/client';
import { getStaticInfoIDParams, createSlug, SlugGenerator } from '../../info';

const countrySlugGenerators: SlugGenerator<Country>[] = [
  (country) => createSlug(country.englishShortName), // Country short name
  (country) => createSlug(country.englishLongName), // Country long name
  (country) => createSlug(country.id.toString()), // Country ID
];

export async function generateStaticParams() {
  const countries = await getCountries('all', 'World');
  return getStaticInfoIDParams(countries, countrySlugGenerators);
}

async function getCountry(slug: string): Promise<Country | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  const encodedSlug = createSlug(decodedSlug);

  const countries = await getCountries('all', 'World');
  const country = countries.find((c) =>
    countrySlugGenerators.some((generator) => generator(c) === encodedSlug)
  );

  return country ?? undefined;
}

export default async function CountryPage({
  params,
}: {
  params: { id: string };
}) {
  const country: Country | undefined = await getCountry(params.id);
  return (
    <div className='flex flex-col items-center'>
      <CountryInfo country={country}></CountryInfo>
    </div>
  );
}
