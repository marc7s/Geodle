import { City, Country, Region } from '@prisma/client';
import { arrayShuffle } from './utils';
import prisma from './db';
import { GameRegion } from './types/routing/generated/regions';

export interface CombinedCountry {
  country: Country;
  capital: City;
}

export async function gameRegionToRegion(
  gameRegion: GameRegion
): Promise<Region | 'World' | null> {
  if (gameRegion === 'World') return 'World';
  return await prisma.region.findUnique({
    where: { name: gameRegion },
  });
}

export async function getCapitals(region: GameRegion): Promise<City[]> {
  const capitals: City[] = await prisma.city.findMany({
    where: {
      isCapital: true,
      country: {
        Region: {
          name: region === 'World' ? undefined : region,
        },
      },
    },
  });
  return capitals;
}

export async function getCombinedCountries(
  region: GameRegion
): Promise<CombinedCountry[]> {
  const countries: Country[] = await prisma.country.findMany({
    where: {
      Region: {
        name: region === 'World' ? undefined : region,
      },
    },
  });
  const capitals: City[] = await getCapitals(region);

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

  return combined;
}
