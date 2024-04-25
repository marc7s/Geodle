import { City, Country, Region } from '@prisma/client';
import { arrayShuffle } from './utils';
import prisma from './app/db';

export interface CombinedCountry {
  country: Country;
  capital: City;
}

export async function stringToRegion(
  str: string
): Promise<Region | 'World' | null> {
  if (str.toLocaleLowerCase() === 'world') return 'World';
  return await prisma.region.findUnique({
    where: { name: str.toLocaleLowerCase() },
  });
}

export async function getCapitals(region: Region | 'World'): Promise<City[]> {
  const capitals: City[] = await prisma.city.findMany({
    where: {
      isCapital: true,
      country: {
        regionId: region === 'World' ? undefined : region.id,
      },
    },
  });
  return arrayShuffle(capitals);
}

export async function getCombinedCountries(): Promise<CombinedCountry[]> {
  const countries: Country[] = await prisma.country.findMany();
  const capitals: City[] = await prisma.city.findMany({
    where: { isCapital: true },
  });

  const combined: CombinedCountry[] = countries.map((c: Country) => {
    const capital: City | undefined = capitals.find(
      (cap) => cap.countryId === c.id
    );
    if (!capital) throw Error(`Capital not found for ${c.englishShortName}`);

    return {
      country: c,
      capital: capital,
    };
  });

  return arrayShuffle(combined);
}
