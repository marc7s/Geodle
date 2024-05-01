import CountryInfo from '@/components/CountryInfo';
import prisma from '@/db';
import { Country } from '@prisma/client';

async function getCountry(slug: string): Promise<Country | undefined> {
  const countryID: number = Number.parseInt(slug) || -1;
  const countryName: string = slug;

  const country = await prisma.country.findFirst({
    where: {
      OR: [
        { id: countryID },
        { englishShortName: countryName },
        { englishLongName: countryName },
      ],
    },
  });

  return country ?? undefined;
}

export default async function CountryPage({ params }: any) {
  const country: Country | undefined = await getCountry(params.id);
  return (
    <>
      <CountryInfo country={country}></CountryInfo>
    </>
  );
}
