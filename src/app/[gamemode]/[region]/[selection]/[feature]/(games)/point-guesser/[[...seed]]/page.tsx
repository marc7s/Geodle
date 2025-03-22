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
  generateStaticSeedParams,
  getSolutions,
} from '@/utils';
import { City, Country } from '@prisma/client';
import styles from './styles.module.scss';
import { GameParams, formatRegion } from '@/types/routing/dynamicParams';
import { PointGuesserGame, SeedInfo } from '@/types/games';
import { getSeed } from '@/backendUtils';

// In training, there is only a single seed
// The order of the array does not matter, as you have to guess them all in any order
// In daily mode, a single value is selected and so then the seed decides the solution
export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(
    () => getPointGuesserPossibilities(gp),
    PointGuesserGame,
    gp,
    gp.params.gamemode === 'training'
  );
}

async function getPointGuesserPossibilities({
  params,
}: GameParams): Promise<(Country | City)[]> {
  switch (params.feature) {
    case 'capitals':
      return await getCapitals(params.selection, params.region);
    case 'countries':
      return await getCountries(params.selection, params.region);
    default:
      throw new Error('Invalid feature');
  }
}

export default async function PointGuesserPage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    PointGuesserGame.getSeededHref({ params: params }, newSeed)
  );

  const config = MapDefaultConfigs.GetConfig(params.region);
  const points: PointInfo[] = [];

  const possibilities: (Country | City)[] = await getPointGuesserPossibilities({
    params,
  });

  switch (params.feature) {
    case 'capitals':
      const cities = possibilities as City[];
      const guessCities: City[] | undefined = getSolutions(
        { params },
        cities,
        seed
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
      const countries = possibilities as Country[];
      const guessCountries: Country[] | undefined = getSolutions(
        { params },
        countries,
        seed
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

  const seedInfo: SeedInfo = {
    seed: seed,
    seedCount: params.gamemode === 'training' ? 1 : possibilities.length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1>
          Guess {params.feature} in {formatRegion(params.region)}
        </h1>
      </div>
      <div>
        <MapPointGuesser
          pointInfos={points}
          config={config}
          gameConfig={{ params: params }}
          seedInfo={seedInfo}
          style={'HideAll'}
        />
      </div>
    </div>
  );
}
