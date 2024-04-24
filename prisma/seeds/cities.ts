import { SeedCoordinate } from './interfaces';
import {
  CSVData,
  getOverrideData,
  parseCSV,
  validateCSVHeaders,
  validateCoordinates,
} from '../parser';
import { ignoredCountries } from './countries';

enum CityCSVHeaders {
  'Geoname ID' = 0,
  'Name',
  'ASCII Name',
  'Alternate Names',
  'Feature Class',
  'Feature Code',
  'Country Code',
  'Country name EN',
  'Country Code 2',
  'Admin1 Code',
  'Admin2 Code',
  'Admin3 Code',
  'Admin4 Code',
  'Population',
  'Elevation',
  'DIgital Elevation Model',
  'Timezone',
  'Modification date',
  'LABEL EN',
  'Coordinates',
}

export interface SeedCity {
  englishName: string;
  domesticName?: string;
  aliases: string[];
  countryEnglishName: string;
  countryISO2Code: string;
  isCapital: boolean;
  coordinates: SeedCoordinate;
}

export async function GetSeedCities(): Promise<SeedCity[]> {
  return new Promise(async (resolve, reject) => {
    // Main dataset
    const csv: CSVData = await parseCSV(
      'prisma/seeds/datasets/cities.csv',
      ';'
    );

    if (!validateCSVHeaders(csv.headers, CityCSVHeaders))
      reject('City CSV did not follow the expected format');

    // Complementary dataset
    const csvComplement: CSVData = await parseCSV(
      'prisma/seeds/datasets/cities.complement.csv',
      ';'
    );

    if (!validateCSVHeaders(csvComplement.headers, CityCSVHeaders))
      reject('City Complement CSV did not follow the expected format');

    // Override dataset
    const csvOverride: CSVData = await parseCSV(
      'prisma/seeds/datasets/cities.override.csv',
      ';'
    );

    if (!validateCSVHeaders(csvOverride.headers, CityCSVHeaders))
      reject('City Override CSV did not follow the expected format');

    const overrideDataProcesser = getOverrideData(
      'City override CSV',
      csvOverride,
      CityCSVHeaders['Geoname ID']
    );

    if (overrideDataProcesser instanceof Error)
      return reject(overrideDataProcesser.message);

    const seedCities: SeedCity[] = [];

    [...csv.data, ...csvComplement.data].forEach((row) => {
      row = overrideDataProcesser(row);

      const countryISO2: string = row[CityCSVHeaders['Country Code']];

      // Skip cities in ignored countries
      if (ignoredCountries.find((ic) => ic.ISO2Code === countryISO2)) return;

      const domesticName: string = row[CityCSVHeaders['Name']];

      // Validate coordinates
      const [validCoordinates, lat, long] = validateCoordinates(
        row[CityCSVHeaders['Coordinates']]
      );
      if (!validCoordinates)
        reject(`Invalid lat or long for city ${domesticName}: ${lat} ${long}`);

      const seedCity: SeedCity = {
        englishName: row[CityCSVHeaders['ASCII Name']],
        domesticName: domesticName,
        aliases: row[CityCSVHeaders['Alternate Names']]
          .split(',')
          .map((n: string) => n.trim()),
        countryEnglishName: row[CityCSVHeaders['Country name EN']],
        countryISO2Code: countryISO2,
        isCapital: row[CityCSVHeaders['Feature Code']] === 'PPLC',
        coordinates: {
          lat: lat,
          long: long,
        },
      };

      seedCities.push(seedCity);
    });

    resolve(seedCities);
  });
}
