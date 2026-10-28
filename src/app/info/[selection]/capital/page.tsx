import { getCombinedCountries, getRegions } from '@/api';
import { Region } from '@prisma/client';
import Link from 'next/link';
import { getCapitalSlugs } from '../../info';
import SelectionSwitch from '../../SelectionSwitch';
import { CountrySelection } from '@/types/routing/dynamicParams';
import { CombinedCountry } from '@/db';

export default async function CapitalsPage(props: {
  params: Promise<{ selection: CountrySelection }>;
}) {
  const { selection } = await props.params;
  const combinedCountries: CombinedCountry[] = await getCombinedCountries(
    selection,
    'World'
  );
  const regions: Region[] = await getRegions();
  // The capital pages are the same for every selection, so the slugs are based on all capitals
  const capitalSlugs: Map<number, string> = getCapitalSlugs(
    await getCombinedCountries('all', 'World')
  );
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
      <div className='text-3xl text-center mb-6'>Capitals by region</div>
      <SelectionSwitch current={selection} kind='capital' />
      <div className='flex items-center'>
        <div className='flex flex-wrap flex-row justify-center items-start w-full'>
          {combinedByRegion.map((cr) => (
            <div key={cr.region.id} className='bg-gray-300 p-5 rounded-xl m-4'>
              <h1 className='text-2xl mb-5'>{cr.region.name}</h1>
              <ol className='text-md'>
                {cr.combined.map((c) => (
                  <li key={c.capital.id}>
                    <Link
                      href={`/info/capital/${capitalSlugs.get(c.capital.id)}`}
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
