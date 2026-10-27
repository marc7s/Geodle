import { PrismaClient } from '@prisma/client';
import { GetSeedCountries, SeedCountry } from './seeds/countries';
import { GetSeedCities, SeedCity } from './seeds/cities';
import {
  createConsoleProgressBar,
  prismaEncodeStringList,
} from '@/backendUtils';

const prisma = new PrismaClient();

async function main() {
  const seedCities: SeedCity[] = await GetSeedCities();
  const seedCountries: SeedCountry[] = await GetSeedCountries(seedCities);

  // Insert regions
  const regionNames: string[] = Array.from(
    new Set(seedCountries.map((sc) => sc.region))
  );
  for (const name of regionNames) {
    await prisma.region.upsert({
      where: { name: name },
      update: {},
      create: { name: name },
    });
  }
  const regionIds: Map<string, number> = new Map(
    (await prisma.region.findMany()).map((r) => [r.name, r.id])
  );

  // Insert countries
  await prisma.country.createMany({
    data: seedCountries.map((sc) => ({
      iso2Code: sc.ISO2Code,
      iso3Code: sc.ISO3Code,
      isIndependent: sc.isIndependent,
      isCurated: sc.isCurated,
      englishShortName: sc.englishShortName,
      englishLongName: sc.englishLongName,
      domesticName: sc.domesticName,
      aliases: prismaEncodeStringList(sc.aliases),
      lat: sc.coordinates.lat,
      long: sc.coordinates.long,
      regionId: regionIds.get(sc.region)!,
      bordersISO3: sc.bordersISO3.join(','),
    })),
  });
  console.log(`Inserted ${seedCountries.length} countries`);

  const countryIds: Map<string, number> = new Map(
    (await prisma.country.findMany()).map((c) => [c.iso2Code, c.id])
  );

  // Insert cities in batches, so we can report progress
  const cities = seedCities.map((sc) => {
    const countryId: number | undefined = countryIds.get(sc.countryISO2Code);
    if (countryId === undefined)
      throw new Error(
        `Could not find country for city ${sc.englishName}, looking for ISOCode2 ${sc.countryISO2Code}`
      );
    return {
      englishName: sc.englishName,
      domesticName: sc.domesticName,
      aliases: prismaEncodeStringList(sc.aliases),
      isCapital: sc.isCapital,
      countryId: countryId,
      lat: sc.coordinates.lat,
      long: sc.coordinates.long,
    };
  });

  const cityProgress = createConsoleProgressBar('Inserting cities');
  cityProgress.start(cities.length, 0);
  const batchSize: number = 10_000;
  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    await prisma.city.createMany({ data: batch });
    cityProgress.increment(batch.length);
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
