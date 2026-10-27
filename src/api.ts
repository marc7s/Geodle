import { Region } from '@prisma/client';
import prisma, {
  getCapitalsDB,
  getCombinedCountriesDB,
  getCountriesDB,
  getCountryPathsDB,
  getCountryRegionDB,
} from './db';

/**
 * Caches the result of a database call for the lifetime of the process.
 *
 * The data is static (it only changes when the database is redeployed), and during `next build`
 * every build worker renders thousands of pages that all ask for the same data.
 * React's `cache()` only deduplicates calls within a single page render,
 * so this cache lets each worker query the database once per unique set of arguments instead of once per page.
 *
 * Arrays are copied on every call, since callers shuffle them in place.
 * Note: in `next dev`, restart the dev server after redeploying the database.
 */
function processCache<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyFn: (...args: A) => string = (...args) => JSON.stringify(args)
): (...args: A) => Promise<R> {
  const results: Map<string, Promise<R>> = new Map();

  return async (...args: A): Promise<R> => {
    const key: string = keyFn(...args);
    let result: Promise<R> | undefined = results.get(key);
    if (!result) {
      result = fn(...args);
      results.set(key, result);
      // Do not cache failures, so the next call can retry
      result.catch(() => results.delete(key));
    }

    const value: R = await result;
    return (Array.isArray(value) ? [...value] : value) as R;
  };
}

export const getRegions = processCache(getRegionsDB);
async function getRegionsDB(): Promise<Region[]> {
  return await prisma.region.findMany({ orderBy: { id: 'asc' } });
}

export const getCountryPaths = processCache(getCountryPathsDB);

export const getCapitals = processCache(getCapitalsDB);

export const getCountries = processCache(getCountriesDB);

export const getCombinedCountries = processCache(getCombinedCountriesDB);

export const getCountryRegion = processCache(getCountryRegionDB, (country) =>
  country.regionId.toString()
);
