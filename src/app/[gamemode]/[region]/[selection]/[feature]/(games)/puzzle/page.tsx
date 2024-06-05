import { getCapitals, getCountries } from '@/api';
import {
  MapConfig,
  MapDefaultConfigs,
  generateStaticFeatureParams,
  getSolutions,
} from '@/utils';
import { City, Country } from '@prisma/client';
import { GameParams, formatRegion } from '@/types/routing/dynamicParams';
import { PuzzleGuesserGame } from '@/types/games';
import PuzzleGuesser from '@/components/games/puzzle/PuzzleGuesser';
import { GeoOutlineData, GeoJsonData } from '@/geoUtils';
import {
  getCityOutlineData,
  getCountryOutlineData,
  getRegionOutlineData,
} from '@/geoBuildUtils';

// PuzzleGuesser supports countries and capitals
export async function generateStaticParams() {
  return generateStaticFeatureParams('countries', 'capitals');
}

export default async function PuzzleGuesserPage({ params }: GameParams) {
  if (params.gamemode === 'daily')
    return <>Puzzle does not have a daily challenge</>;

  const config: GameParams = {
    params: params,
  };

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };

  const pieces: GeoOutlineData[] = [];
  const backgroundData: GeoJsonData[] = getRegionOutlineData(params.region);

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );
      const correctCountries: Country[] | undefined = getSolutions(
        PuzzleGuesserGame,
        config,
        countries
      );
      if (!correctCountries) return <>Error! Could not generate the solution</>;
      const countryPuzzlePieces: GeoOutlineData[] = correctCountries.map((c) =>
        getCountryOutlineData(c, true)
      );
      pieces.push(...countryPuzzlePieces);
      break;
    case 'capitals':
      const capitals: City[] = await getCapitals(
        params.selection,
        params.region
      );
      const correctCapitals: City[] | undefined = getSolutions(
        PuzzleGuesserGame,
        config,
        capitals
      );
      if (!correctCapitals) return <>Error! Could not generate the solution</>;
      const cityPuzzlePieces: GeoOutlineData[] = correctCapitals.map((c) =>
        getCityOutlineData(c)
      );
      pieces.push(...cityPuzzlePieces);
      break;
  }

  return (
    <>
      <PuzzleGuesser
        title={`Guess all ${params.feature} in ${formatRegion(params.region)}`}
        feature={params.feature}
        puzzlePieces={pieces}
        backgroundData={backgroundData}
        gameConfig={config}
        mapConfig={mapConfig}
      />
    </>
  );
}
