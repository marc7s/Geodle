import { PrismaClient, Region } from '@prisma/client';
import { GetSeedCountries, SeedCountry } from './seeds/countries';
import { GetSeedCities, SeedCity } from './seeds/cities';
import {
  createConsoleProgressBar,
  prismaEncodeStringList,
} from '@/backendUtils';

const prisma = new PrismaClient();

async function upsertRegion(name: string) {
  return await prisma.region.upsert({
    where: {
      name: name,
    },
    update: {},
    create: {
      name: name,
    },
  });
}

async function createCountry(seedCountry: SeedCountry, region: Region) {
  return await prisma.country.create({
    data: {
      iso2Code: seedCountry.ISO2Code,
      iso3Code: seedCountry.ISO3Code,
      englishShortName: seedCountry.englishShortName,
      englishLongName: seedCountry.englishLongName,
      domesticName: seedCountry.domesticName,
      aliases: prismaEncodeStringList(seedCountry.aliases),
      lat: seedCountry.coordinates.lat,
      long: seedCountry.coordinates.long,
      regionId: region.id,
    },
  });
}

async function createCity(seedCity: SeedCity) {
  return await prisma.city.create({
    data: {
      englishName: seedCity.englishName,
      domesticName: seedCity.domesticName,
      aliases: prismaEncodeStringList(seedCity.aliases),
      isCapital: seedCity.isCapital,
      countryId: (
        await prisma.country
          .findUniqueOrThrow({
            where: {
              iso2Code: seedCity.countryISO2Code,
            },
          })
          .catch((err) => {
            console.error(
              `Could not find country for city ${seedCity.englishName}, looking for ISOCode2 ${seedCity.countryISO2Code}`
            );
            throw err;
          })
      ).id,
      lat: seedCity.coordinates.lat,
      long: seedCity.coordinates.long,
    },
  });
}

async function main() {
  const seedCities: SeedCity[] = await GetSeedCities();
  const seedCountries: SeedCountry[] = await GetSeedCountries(seedCities);

  // Insert countries and regions
  const countryProgress = createConsoleProgressBar('Inserting countries');
  countryProgress.start(seedCountries.length + 1, 1);
  for (const seedCountry of seedCountries) {
    const region = await upsertRegion(seedCountry.region);
    await createCountry(seedCountry, region);
    countryProgress.increment();
  }
  countryProgress.stop();

  // Insert cities
  const cityProgress = createConsoleProgressBar('Inserting cities');
  cityProgress.start(seedCities.length + 1, 1);

  // There are so many cities that seeding them all in parallell causes the database to run out of memory
  // However, seeding them all in series is much slower
  // Therefore, split the cities into batches before inserting the batches in parallell
  const batchSize: number = 10_000;
  const cityBatches: SeedCity[][] = [];
  let currBatch: SeedCity[] = [];

  for (let i = 0; i < seedCities.length; i++) {
    currBatch.push(seedCities[i]);

    if (i > 0 && (i % batchSize === 0 || i === seedCities.length - 1)) {
      cityBatches.push(currBatch);
      currBatch = [];
    }
  }

  // Insert the cities in parallell, but wait until the entire batch is complete before continuing with the next
  for (const cityBatch of cityBatches) {
    await Promise.all(
      cityBatch.map(async (sc) => {
        await createCity(sc).then(() => {
          cityProgress.increment();
        });
      })
    );
  }
  cityProgress.stop();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
