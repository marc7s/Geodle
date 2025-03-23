import { Region } from '@prisma/client';
import prisma, {
  getCapitalsDB,
  getCombinedCountriesDB,
  getCountriesDB,
  getCountryPathsDB,
  getCountryRegionDB,
} from './db';
import { cache } from 'react';

export const getRegions = cache(getRegionsDB);
async function getRegionsDB(): Promise<Region[]> {
  return await prisma.region.findMany();
}

export const getCountryPaths = cache(getCountryPathsDB);

export const getCapitals = cache(getCapitalsDB);

export const getCountries = cache(getCountriesDB);

export const getCombinedCountries = cache(getCombinedCountriesDB);

export const getCountryRegion = cache(getCountryRegionDB);
