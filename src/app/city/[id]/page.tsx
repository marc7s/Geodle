import prisma from '@/app/db';
import { City } from '@prisma/client';

async function getCity(slug: string): Promise<City | undefined> {
  const cityID: number = Number.parseInt(slug) || -1;
  const cityName: string = slug;

  const city = await prisma.city.findFirst({
    where: {
      OR: [{ id: cityID }, { englishName: cityName }],
    },
  });

  return city ?? undefined;
}

export default async function CityPage({ params }: any) {
  const city: City | undefined = await getCity(params.id);
  return <>{city?.englishName}</>;
}
