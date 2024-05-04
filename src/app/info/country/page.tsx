import { getCountries, getRegions } from '@/api';
import { Country, Region } from '@prisma/client';
import Link from 'next/link';
import { createSlug } from '../info';

export default async function CountriesPage({
  params,
}: {
  params: { id: string };
}) {
  const countries: Country[] = await getCountries('all', 'World');
  const regions: Region[] = await getRegions();
  const countriesByRegion: { region: Region; countries: Country[] }[] = [];
  countries.forEach(async (c) => {
    const countryRegion: Region | undefined = regions.find(
      (r) => r.id === c.regionId
    );
    if (!countryRegion)
      throw new Error(`Region not found for ${c.englishShortName}`);
    const regionCountries = countriesByRegion.find(
      (cr) => cr.region.id === c.regionId
    );
    if (regionCountries) regionCountries.countries.push(c);
    else countriesByRegion.push({ region: countryRegion, countries: [c] });
  });

  return (
    <>
      <div className='text-3xl text-center mb-10'>Countries by region</div>
      <div className='flex items-center'>
        <div className='flex flex-wrap flex-row justify-center items-start w-full'>
          {countriesByRegion.map((cr) => (
            <div key={cr.region.id} className='bg-gray-300 p-5 rounded-xl m-4'>
              <h1 className='text-2xl mb-5'>{cr.region.name}</h1>
              <ol className='text-md'>
                {cr.countries.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/info/country/${createSlug(c.englishShortName)}`}
                    >
                      {c.englishShortName}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
