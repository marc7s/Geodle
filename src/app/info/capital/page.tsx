import { getCombinedCountries, getRegions } from '@/api';
import { Region } from '@prisma/client';
import Link from 'next/link';
import { createSlug } from '../info';
import { CombinedCountry } from '@/db';

export default async function CountriesPage({
  params,
}: {
  params: { id: string };
}) {
  const combinedCountries: CombinedCountry[] = await getCombinedCountries(
    'all',
    'World'
  );
  const regions: Region[] = await getRegions();
  const combinedByRegion: { region: Region; combined: CombinedCountry[] }[] =
    [];

  combinedCountries.forEach(async (c) => {
    const combinedRegion: Region | undefined = regions.find(
      (r) => r.id === c.country.regionId
    );
    if (!combinedRegion)
      throw new Error(`Region not found for ${c.capital.englishName}`);
    const regionCountries = combinedByRegion.find(
      (cr) => cr.region.id === c.country.regionId
    );
    if (regionCountries) regionCountries.combined.push(c);
    else combinedByRegion.push({ region: combinedRegion, combined: [c] });
  });

  return (
    <>
      <div className='text-3xl text-center mb-10'>Capitals by region</div>
      <div className='flex items-center'>
        <div className='flex flex-wrap flex-row justify-center items-start w-full'>
          {combinedByRegion.map((cr) => (
            <div key={cr.region.id} className='bg-gray-300 p-5 rounded-xl m-4'>
              <h1 className='text-2xl mb-5'>{cr.region.name}</h1>
              <ol className='text-md'>
                {cr.combined.map((c) => (
                  <li key={c.capital.id}>
                    <Link
                      href={`/info/capital/${createSlug(c.capital.englishName)}`}
                    >
                      {c.capital.englishName}, {c.country.englishShortName}
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
