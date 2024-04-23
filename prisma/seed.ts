import { PrismaClient } from '@prisma/client';
import { SeedCountries, SeedCountry } from './seeds/countries';
import { SeedCities, SeedCity } from './seeds/cities';
import { prismaEncodeStringList } from '@/utils';

const prisma = new PrismaClient();

async function createCountry(seedCountry: SeedCountry) {
  return await prisma.country.create({
    data: {
      englishShortName: seedCountry.englishShortName,
      englishLongName: seedCountry.englishLongName,
      domesticName: seedCountry.domesticName,
      aliases: prismaEncodeStringList(seedCountry.aliases),
      populationCount: seedCountry.population.count,
      populationYear: seedCountry.population.year,
      lat: seedCountry.coordinates.lat,
      long: seedCountry.coordinates.long,
    },
  });
}

async function createFlag(countryId: number) {
  return await prisma.flag.create({
    data: {
      countryId: countryId,
    },
  });
}

async function createCity(seedCity: SeedCity, isCapital: boolean) {
  return await prisma.city.create({
    data: {
      englishName: seedCity.englishName,
      domesticName: seedCity.domesticName,
      aliases: prismaEncodeStringList(seedCity.aliases),
      isCapital: isCapital,
      populationCount: seedCity.population.count,
      populationYear: seedCity.population.year,
      countryId: (
        await prisma.country.findUniqueOrThrow({
          where: {
            englishShortName: seedCity.countryEnglishName,
          },
        })
      ).id,
      lat: seedCity.coordinates.lat,
      long: seedCity.coordinates.long,
    },
  });
}

async function main() {
  SeedCountries.forEach(async (sc) => {
    const country = await createCountry(sc);
    await createFlag(country.id);
    await createCity(sc.capital, true);
  });

  SeedCities.forEach(async (sc) => {
    await createCity(sc, false);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
