import { getCapitals, stringToRegion } from '@/api';
import MapPointGuesser, { PointInfo } from '@/components/MapPointGuesser';
import { MapDefaultConfigs } from '@/utils';
import { City, Region } from '@prisma/client';
import styles from './styles.module.scss';

export default async function CityGuessPage({ params }: any) {
  let cities: City[] = [];
  let type: string = '';

  const region: Region | 'World' | null = await stringToRegion(params.region);
  if (!region) return <>Error! Region unknown</>;
  const config = MapDefaultConfigs.GetConfig(region);

  switch (params.type.toLocaleLowerCase()) {
    case 'capitals':
      cities = await getCapitals(region);
      type = 'capitals';
      break;
  }

  const points: PointInfo[] = cities.map((c) => {
    return {
      position: [c.lat, c.long],
      complete: false,
      title: {
        completed: c.englishName,
      },
      answers: [c.englishName],
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1>
          Guess {type} in {region === 'World' ? region : region.name}
        </h1>
      </div>
      <div>
        <MapPointGuesser
          points={points}
          config={config}
          style={'HideAll'}
          stadiaMapsAPIKey={process.env.STADIA_MAPS_API_KEY}
        />
      </div>
    </div>
  );
}
