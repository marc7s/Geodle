import { getCapitals, getCountries } from '@/api';
import { MapConfig, MapDefaultConfigs, getUnsupportedReason } from '@/utils';
import { GamePageProps, formatRegion } from '@/types/routing/dynamicParams';
import { PuzzleGuesserGame } from '@/types/games';
import PuzzleGuesser from '@/components/games/puzzle/PuzzleGuesser';
import { GeoOutlineData, GeoJsonSource } from '@/geoUtils';
import {
  getCityOutlineData,
  getCountryOutlineData,
  getRegionOutlineData,
} from '@/geoBuildUtils';

// Puzzle has no daily mode, and in training all pieces are guessed, so the client only shuffles the pieces
export default async function PuzzleGuesserPage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    PuzzleGuesserGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };

  let pieces: GeoOutlineData[] = [];
  const backgroundData: GeoJsonSource[] = getRegionOutlineData(params.region);

  switch (params.feature) {
    case 'countries':
      pieces = (await getCountries(params.selection, params.region)).map((c) =>
        getCountryOutlineData(c, true)
      );
      break;
    case 'capitals':
      pieces = (await getCapitals(params.selection, params.region)).map((c) =>
        getCityOutlineData(c)
      );
      break;
  }

  if (pieces.length < 1) return <>Error! Could not generate the solution</>;

  return (
    <>
      <PuzzleGuesser
        title={`Guess all ${params.feature} in ${formatRegion(params.region)}`}
        feature={params.feature}
        puzzlePieces={pieces}
        backgroundData={backgroundData}
        gameConfig={{ params: params }}
        mapConfig={mapConfig}
      />
    </>
  );
}
