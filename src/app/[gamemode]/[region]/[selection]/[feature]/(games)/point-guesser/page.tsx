import MapPointGuesser from '@/components/MapPointGuesserClient';
import { getCapitals, getCountries } from '@/api';
import type { PointInfo } from '@/components/MapPointGuesser';
import { MapDefaultConfigs, getUnsupportedReason } from '@/utils';
import { City, Country } from '@prisma/client';
import styles from './styles.module.scss';
import { GamePageProps, formatRegion } from '@/types/routing/dynamicParams';
import { PointGuesserGame } from '@/types/games';

function cityToPoint(c: City): PointInfo {
  return {
    position: [c.lat, c.long],
    complete: false,
    title: {
      completed: c.englishName,
    },
    answers: [c.englishName],
  };
}

function countryToPoint(c: Country): PointInfo {
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
}

export default async function PointGuesserPage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    PointGuesserGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  const config = MapDefaultConfigs.GetConfig(params.region);

  // The client picks the points to guess, based on the seed
  // In training, all points are guessed. In daily mode, a single point is picked
  let possiblePoints: PointInfo[] = [];
  switch (params.feature) {
    case 'capitals':
      possiblePoints = (
        await getCapitals(params.selection, params.region)
      ).map(cityToPoint);
      break;
    case 'countries':
      possiblePoints = (
        await getCountries(params.selection, params.region)
      ).map(countryToPoint);
      break;
  }

  if (possiblePoints.length < 1) return <>Error! Could not get solutions</>;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1>
          Guess {params.feature} in {formatRegion(params.region)}
        </h1>
      </div>
      <div>
        <MapPointGuesser
          possiblePoints={possiblePoints}
          config={config}
          gameConfig={{ params: params }}
          style={'HideAll'}
        />
      </div>
    </div>
  );
}
