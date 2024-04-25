import { getCapitals, stringToRegion } from '@/api';
import MapPointGuesser, { PointInfo } from '@/components/MapPointGuesser';
import { MapDefaultConfigs } from '@/utils';
import { City, Region } from '@prisma/client';

export default async function CityGuessPage({ params }: any) {
  let cities: City[] = [];

  const region: Region | 'World' | null = await stringToRegion(params.region);
  if (!region) return <>Error! Region unknown</>;
  const config = MapDefaultConfigs.GetConfig(region);

  switch (params.type.toLocaleLowerCase()) {
    case 'capitals':
      cities = await getCapitals(region);
      break;
  }

  const points: PointInfo[] = cities.map((c) => {
    return { position: [c.lat, c.long] };
  });

  return <MapPointGuesser points={points} config={config} />;
}
