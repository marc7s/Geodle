import { getCapitals } from '@/api';
import MapPointGuesser, { PointInfo } from '@/components/MapPointGuesser';
import { MapDefaultConfigs, generateStaticFeatureParams } from '@/utils';
import { City } from '@prisma/client';
import styles from './styles.module.scss';
import { GameParams } from '@/types/routing/dynamicParams';

// CityGuessGame only supports capitals
export async function generateStaticParams() {
  return generateStaticFeatureParams('capitals');
}

export default async function CityGuessPage({ params }: GameParams) {
  let cities: City[] = [];

  const config = MapDefaultConfigs.GetConfig(params.region);

  switch (params.feature) {
    case 'capitals':
      cities = await getCapitals(params.region);
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
          Guess {params.feature} in {params.region}
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
