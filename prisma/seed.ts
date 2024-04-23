import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCountry(
  shortName: string,
  longName: string,
  population: number,
  populationYear: number
) {
  return await prisma.country.create({
    data: {
      shortName: shortName,
      longName: longName,
      population: population,
      populationYear: populationYear,
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

async function createCity(
  name: string,
  isCapital: boolean,
  countryId: number,
  population: number,
  populationYear: number,
  lat: number,
  long: number
) {
  return await prisma.city.create({
    data: {
      name: name,
      isCapital: isCapital,
      countryId: countryId,
      population: population,
      populationYear: populationYear,
      lat: lat,
      long: long,
    },
  });
}

async function main() {
  console.log('Adding countries...');
  const sweden = await createCountry('Sweden', 'Sweden', 10_661_715, 2024);
  const norway = await createCountry('Norway', 'Norway', 5_488_984, 2023);
  console.log(sweden);

  console.log('Adding flags...');
  const swedenFlag = await createFlag(sweden.id);
  const norwayFlag = await createFlag(norway.id);
  console.log(swedenFlag);

  console.log('Adding cities...');
  const stockholm = await createCity(
    'Stockholm',
    true,
    sweden.id,
    975_551,
    2020,
    59.334591,
    18.06324
  );
  const oslo = await createCity(
    'Oslo',
    true,
    norway.id,
    709_037,
    2022,
    59.911491,
    10.757933
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
