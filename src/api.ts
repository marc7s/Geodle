import { City, Country, CountryPaths, Region } from '@prisma/client';
import prisma from './db';
import { GameRegion } from './types/routing/generated/regions';
import { CountrySelection } from './types/routing/dynamicParams';

export interface CombinedCountry {
  country: Country;
  capital: City;
}

export interface CountryPath {
  country1: Country;
  country2: Country;
  paths: Country[][];
}

export async function getRegions(): Promise<Region[]> {
  return await prisma.region.findMany();
}

export async function getCountryPaths(
  selection: CountrySelection,
  region: GameRegion
): Promise<CountryPath[]> {
  const countryPaths: CountryPaths[] = await prisma.countryPaths.findMany({
    where: {
      selection: selection,
      region: region,
    },
  });
  const countryCache: Map<string, Country> = new Map();

  async function getCountry(iso3Code: string): Promise<Country> {
    if (countryCache.has(iso3Code)) return countryCache.get(iso3Code)!;
    const country: Country | null = await prisma.country.findUnique({
      where: { iso3Code: iso3Code },
    });
    if (!country) throw Error(`Country not found for ${iso3Code}`);
    countryCache.set(iso3Code, country);

    return country;
  }

  return Promise.all(
    countryPaths.map(async (cp) => {
      const c1: Country = await getCountry(cp.country1ISO3);
      const c2: Country = await getCountry(cp.country2ISO3);
      const pathCountries: Country[][] = await Promise.all(
        cp.path.split(';').map(async (p) => {
          return await Promise.all(p.split(',').map(getCountry));
        })
      );

      return {
        country1: c1,
        country2: c2,
        paths: pathCountries,
      };
    })
  );
}

export async function getCapitals(
  selection: CountrySelection,
  region: GameRegion
): Promise<City[]> {
  const capitals: City[] = await prisma.city.findMany({
    where: {
      isCapital: true,
      country: {
        Region: {
          name: region === 'World' ? undefined : region,
        },
        isCurated: selection === 'curated' ? true : undefined,
        isIndependent: selection === 'independent' ? true : undefined,
      },
    },
  });
  return capitals;
}

export async function getCountries(
  selection: CountrySelection,
  region: GameRegion
): Promise<Country[]> {
  const countries: Country[] = await prisma.country.findMany({
    where: {
      Region: {
        name: region === 'World' ? undefined : region,
      },
      isCurated: selection === 'curated' ? true : undefined,
      isIndependent: selection === 'independent' ? true : undefined,
    },
  });
  return countries;
}

export async function getCombinedCountries(
  selection: CountrySelection,
  region: GameRegion
): Promise<CombinedCountry[]> {
  const countries: Country[] = await getCountries(selection, region);
  const capitals: City[] = await getCapitals(selection, region);

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

export async function getCountryRegion(country: Country): Promise<Region> {
  const region = await prisma.region.findUnique({
    where: { id: country.regionId },
  });
  if (!region) throw Error(`Region not found for ${country.englishShortName}`);
  return region;
}
