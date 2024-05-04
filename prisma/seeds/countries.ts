import {
  CSVData,
  getOverrideData,
  parseCSV,
  validateCSVHeaders,
  validateCoordinates,
} from '../parser';
import { SeedCity } from './cities';
import { SeedCoordinate } from './interfaces';

enum CountryCSVHeaders {
  'name.common' = 0,
  'name.official',
  'cca2',
  'cca3',
  'independent',
  'capital',
  'region',
  'latlng',
  'borders',
  'area',
}

enum CuratedCountryCSVHeaders {
  'iso3Code' = 0,
  'curated',
  'reason',
}

interface CuratedCountry {
  iso3Code: string;
  isCurated: boolean;
  reason?: string;
}

interface IgnoredCountry {
  ISO2Code: string;
  reason: string;
}

export const ignoredCountries: IgnoredCountry[] = [
  {
    ISO2Code: 'AQ',
    reason: 'Part of Antarctica',
  },
  {
    ISO2Code: 'TF',
    reason: 'Part of Antarctica',
  },
  {
    ISO2Code: 'GS',
    reason: 'Part of Antarctica',
  },
  {
    ISO2Code: 'BV',
    reason: 'Part of Antarctica',
  },
  {
    ISO2Code: 'HM',
    reason: 'Part of Antarctica',
  },
  {
    ISO2Code: 'UM',
    reason: 'US Outlying islands, nine island territories, not a country',
  },
];

export interface SeedCountry {
  ISO2Code: string;
  ISO3Code: string;
  isIndependent: boolean;
  isCurated: boolean;
  region: string;
  englishShortName: string;
  englishLongName?: string;
  domesticName: string;
  aliases: string[];
  coordinates: SeedCoordinate;
  capital: SeedCity;
}

function onlyASCIIChars(str: string): string {
  return str.replace(/[^A-Za-z]/g, '');
}

export async function GetSeedCountries(
  seedCities: SeedCity[]
): Promise<SeedCountry[]> {
  return new Promise(async (resolve, reject) => {
    // Main dataset
    const csv: CSVData = await parseCSV(
      'https://raw.githubusercontent.com/marc7s/countries/master/geodle/countries.csv',
      ',',
      true
    );

    if (!validateCSVHeaders(csv.headers, CountryCSVHeaders))
      reject('Country CSV did not follow the expected format');

    // Override dataset
    const csvOverride: CSVData = await parseCSV(
      'prisma/seeds/datasets/countries.override.csv',
      ','
    );

    if (!validateCSVHeaders(csvOverride.headers, CountryCSVHeaders))
      reject('Country Override CSV did not follow the expected format');

    // Curated dataset
    const csvCurated: CSVData = await parseCSV(
      'prisma/seeds/datasets/countries.curated.csv',
      ';'
    );

    if (!validateCSVHeaders(csvCurated.headers, CuratedCountryCSVHeaders))
      reject('Curated countries CSV did not follow the expected format');

    const overrideDataProcesser = getOverrideData(
      'Country override CSV',
      csvOverride,
      CountryCSVHeaders['cca2']
    );

    if (overrideDataProcesser instanceof Error)
      return reject(overrideDataProcesser.message);

    const seedCountries: SeedCountry[] = [];
    const curatedCountries: CuratedCountry[] = csvCurated.data.map((row) => {
      return {
        iso3Code: row[CuratedCountryCSVHeaders['iso3Code']],
        isCurated: row[CuratedCountryCSVHeaders['curated']] === '1',
        reason: row[CuratedCountryCSVHeaders['reason']],
      };
    });

    csv.data.forEach((row) => {
      row = overrideDataProcesser(row);

      const countryISO2: string = row[CountryCSVHeaders['cca2']];
      const countryISO3: string = row[CountryCSVHeaders['cca3']];
      const countryCapitalName: string = row[CountryCSVHeaders['capital']]
        .split(',')[0]
        .trim();
      const englishShortName: string = row[CountryCSVHeaders['name.common']];
      const countryRegion: string = row[CountryCSVHeaders['region']];
      const logCountryName: string = `country ${englishShortName} (${countryISO2})`;

      // Skip ignored countries
      if (ignoredCountries.find((ic) => ic.ISO2Code === countryISO2)) return;

      // Antarctica should be skipped, so ensure all countries in that region are ignored
      if (countryRegion === 'Antarctic')
        reject(
          `Country ${logCountryName} is part of the Antarctic but not in the ignored country list`
        );

      // Validate coordinates
      const [validCoordinates, lat, long] = validateCoordinates(
        row[CountryCSVHeaders['latlng']]
      );
      if (!validCoordinates)
        reject(
          `Invalid lat or long for city ${englishShortName}: ${lat} ${long}`
        );

      // Validate capital
      const capital: SeedCity | undefined = seedCities.find(
        (c) => c.countryISO2Code === countryISO2 && c.isCapital
      );
      if (capital === undefined)
        return reject(
          `Capital not found for ${logCountryName}. Looking for ${countryCapitalName}`
        );
      const countryASCIICapital: string = onlyASCIIChars(countryCapitalName);
      const cityASCIICapital: string = onlyASCIIChars(
        capital.domesticName ?? capital.englishName
      );
      if (countryASCIICapital !== cityASCIICapital)
        return reject(
          `Capital name does not match for ${logCountryName}.\nCountry capital: ${countryASCIICapital}\nCity capital: ${cityASCIICapital}`
        );

      const curatedEntry: CuratedCountry | undefined = curatedCountries.find(
        (cc) => cc.iso3Code === countryISO3
      );

      if (!curatedEntry)
        return reject(`No curated entry found for ${logCountryName}`);

      const seedCountry: SeedCountry = {
        ISO2Code: countryISO2,
        ISO3Code: countryISO3,
        isIndependent: row[CountryCSVHeaders['independent']] === '1',
        isCurated: curatedEntry.isCurated,
        region: countryRegion,
        englishShortName: englishShortName,
        englishLongName: row[CountryCSVHeaders['name.official']],
        domesticName: row[CountryCSVHeaders['name.official']],
        aliases: [],
        coordinates: {
          lat: lat,
          long: long,
        },
        capital: capital,
      };

      seedCountries.push(seedCountry);
    });

    resolve(seedCountries);
  });
}
