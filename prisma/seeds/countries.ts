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

interface IgnoredCountry {
  ISO2Code: string;
  reason: string;
}

export const ignoredCountries: IgnoredCountry[] = [
  {
    ISO2Code: 'AQ',
    reason: 'Antarctica, not a country',
  },
  {
    ISO2Code: 'BV',
    reason: 'Island outside Antarctica, dependency of Norway',
  },
  {
    ISO2Code: 'HM',
    reason: 'Australian external territory, uninhabited',
  },
  {
    ISO2Code: 'UM',
    reason: 'US Outlying islands, nine island territories, not a country',
  },
];

export interface SeedCountry {
  ISO2Code: string;
  ISO3Code: string;
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
      'https://raw.githubusercontent.com/marc7s/countries/master/geodl/countries.csv',
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

    const overrideDataProcesser = getOverrideData(
      'Country override CSV',
      csvOverride,
      CountryCSVHeaders['cca2']
    );

    if (overrideDataProcesser instanceof Error)
      return reject(overrideDataProcesser.message);

    const seedCountries: SeedCountry[] = [];

    csv.data.forEach((row) => {
      row = overrideDataProcesser(row);

      const countryISO2: string = row[CountryCSVHeaders['cca2']];
      const countryCapitalName: string = row[CountryCSVHeaders['capital']]
        .split(',')[0]
        .trim();
      const englishShortName: string = row[CountryCSVHeaders['name.common']];
      const logCountryName: string = `country ${englishShortName} (${countryISO2})`;

      // Skip ignored countries
      if (ignoredCountries.find((ic) => ic.ISO2Code === countryISO2)) return;

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

      const seedCountry: SeedCountry = {
        ISO2Code: countryISO2,
        ISO3Code: row[CountryCSVHeaders['cca3']],
        region: row[CountryCSVHeaders['region']],
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
