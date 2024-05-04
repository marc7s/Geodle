import { getCountries } from '@/api';
import CountryInfo from '@/components/CountryInfo';
import { Country } from '@prisma/client';
import { getStaticInfoIDParams, createSlug } from '../../info';

export async function generateStaticParams() {
  const countries = await getCountries('all', 'World');
  return getStaticInfoIDParams(countries, (c: Country) => [
    c.id.toString(),
    c.englishShortName,
    c.englishLongName,
  ]);
}

async function getCountry(slug: string): Promise<Country | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  const countryID: number = Number.parseInt(decodedSlug) || -1;
  const countryName: string | undefined = createSlug(decodedSlug);

  const countries = await getCountries('all', 'World');
  const country = countries.find(
    (c) =>
      c.id === countryID ||
      createSlug(c.englishShortName) === countryName ||
      createSlug(c.englishLongName) === countryName
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
