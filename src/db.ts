import {
  City,
  Country,
  CountryPaths,
  PrismaClient,
  Region,
} from '@prisma/client';
import { CountrySelection } from './types/routing/dynamicParams';
import { GameRegion } from './types/routing/generated/regions';

export interface CombinedCountry {
  country: Country;
  capital: City;
}

export interface CountryPath {
  country1: Country;
  country2: Country;
  paths: Country[][];
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export async function getRegionsDB(): Promise<Region[]> {
  return await prisma.region.findMany();
}

export async function getCountryPathsDB(
  selection: CountrySelection,
  region: GameRegion
): Promise<CountryPath[]> {
  const countryPaths: CountryPaths[] = await prisma.countryPaths.findMany({
    where: {
      selection: selection,
      region: region,
    },
  });
  const countries: Country[] = await getCountriesDB(selection, region);
  const countryCache: Map<string, Country> = new Map();

  function getCountry(
    iso3Code: string,
    errorOnNotFound: boolean = false
  ): Country | undefined {
    if (countryCache.has(iso3Code)) return countryCache.get(iso3Code)!;

    const country: Country | undefined = countries.find(
      (c) => c.iso3Code === iso3Code
    );
    if (!country && errorOnNotFound)
      throw Error(`Country not found for ${iso3Code}`);

    if (country) countryCache.set(iso3Code, country);
    return country;
  }

  return countryPaths.map((cp) => {
    const c1: Country = getCountry(cp.country1ISO3, true)!;
    const c2: Country = getCountry(cp.country2ISO3, true)!;
    const pathCountries: Country[][] = cp.path.split(';').map(
      (p) =>
        p
          .split(',')
          .map((iso3Code) => getCountry(iso3Code))
          .filter((c) => c !== undefined) as Country[]
    );

    return {
      country1: c1,
      country2: c2,
      paths: pathCountries,
    };
  });
}

export async function getCapitalsDB(
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
        isIndependent: selection === 'independent' ? true : undefined,
      },
    },
  });
  return capitals;
}

export async function getCountriesDB(
  selection: CountrySelection,
  region: GameRegion
): Promise<Country[]> {
  const countries: Country[] = await prisma.country.findMany({
    where: {
      Region: {
        name: region === 'World' ? undefined : region,
      },
      isIndependent: selection === 'independent' ? true : undefined,
    },
  });
  return countries;
}

export async function getCombinedCountriesDB(
  selection: CountrySelection,
  region: GameRegion
): Promise<CombinedCountry[]> {
  const countries: Country[] = await getCountriesDB(selection, region);
  const capitals: City[] = await getCapitalsDB(selection, region);

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

export async function getCountryRegionDB(country: Country): Promise<Region> {
  const region = await prisma.region.findUnique({
    where: { id: country.regionId },
  });
  if (!region) throw Error(`Region not found for ${country.englishShortName}`);
  return region;
}
