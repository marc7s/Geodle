import { PrismaClient } from '@prisma/client';
import { GetSeedCountries, SeedCountry } from './seeds/countries';
import { GetSeedCities, SeedCity } from './seeds/cities';
import { prismaEncodeStringList } from '@/utils';

const prisma = new PrismaClient();

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createCountry(seedCountry: SeedCountry) {
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

  seedCountries.forEach(async (sc) => {
    await createCountry(sc);
  });

  // There are so many cities that seeding them all causes the database to run out of memory
  // Therefore, split the cities into batches before inserting them
  const batchSize: number = 5000;
  const timeoutBackoffCoefficient: number = 0.5;
  const cityBatches: SeedCity[][] = [];
  let currBatch: SeedCity[] = [];

  for (let i = 0; i < seedCities.length; i++) {
    currBatch.push(seedCities[i]);

    if (i > 0 && (i % batchSize === 0 || i === seedCities.length - 1)) {
      cityBatches.push(currBatch);
      currBatch = [];
    }
  }

  // Insert each batch one after the other, with an incremental backoff between each batch
  for (let i = 0; i < cityBatches.length; i++) {
    const indexStart: number = i * batchSize;
    const indexEnd: number =
      i === cityBatches.length - 1
        ? seedCities.length
        : (i + 1) * batchSize - 1;
    console.log(
      `[${i + 1}/${cityBatches.length}] Creating cities ${indexStart}-${indexEnd}`
    );
    cityBatches[i].forEach(async (sc) => {
      await createCity(sc);
    });
    await timeout(timeoutBackoffCoefficient * i * 1000);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
