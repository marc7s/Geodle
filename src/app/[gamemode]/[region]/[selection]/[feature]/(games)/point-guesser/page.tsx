// Disable SSR for maps, as it will throw errors due to being out of sync otherwise
// See https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr
import dynamic from 'next/dynamic';
const MapPointGuesser = dynamic(() => import('@/components/MapPointGuesser'), {
  ssr: false,
});

import { getCapitals, getCountries } from '@/api';
import { PointInfo } from '@/components/MapPointGuesser';
import {
  MapDefaultConfigs,
  generateStaticFeatureParams,
  getSolutions,
} from '@/utils';
import { City, Country } from '@prisma/client';
import styles from './styles.module.scss';
import { GameParams, formatRegion } from '@/types/routing/dynamicParams';
import { PointGuesserGame } from '@/types/games';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...PointGuesserGame.allowedFeatures);
}

export default async function PointGuesserPage({ params }: GameParams) {
  const config = MapDefaultConfigs.GetConfig(params.region);
  const points: PointInfo[] = [];

  switch (params.feature) {
    case 'capitals':
      const cities = await getCapitals(params.selection, params.region);
      const guessCities: City[] | undefined = getSolutions(
        PointGuesserGame,
        {
          params: params,
        },
        cities
      );
      if (!guessCities) return <>Error! Could not get solutions</>;
      const cityPoints: PointInfo[] = guessCities.map((c) => {
        return {
          position: [c.lat, c.long],
          complete: false,
          title: {
            completed: c.englishName,
          },
          answers: [c.englishName],
        };
      });
      points.push(...cityPoints);
      break;
    case 'countries':
      const countries = await getCountries(params.selection, params.region);
      const guessCountries: Country[] | undefined = getSolutions(
        PointGuesserGame,
        {
          params: params,
        },
        countries
      );
      if (!guessCountries) return <>Error! Could not get solutions</>;
      const countryPoints: PointInfo[] = guessCountries.map((c) => {
        const ans: string[] = [c.englishShortName];
        if (c.englishLongName) ans.push(c.englishLongName);
        return {
          position: [c.lat, c.long],
          complete: false,
          title: {
            completed: c.englishShortName,
          },
          answers: ans,
        };
      });
      points.push(...countryPoints);
      break;
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1>
          Guess {params.feature} in {formatRegion(params.region)}
        </h1>
      </div>
      <div>
        <MapPointGuesser
          points={points}
          config={config}
          gameConfig={{ params: params }}
          style={'HideAll'}
        />
      </div>
    </div>
  );
}
