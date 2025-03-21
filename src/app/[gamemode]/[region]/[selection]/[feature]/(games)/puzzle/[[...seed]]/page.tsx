import { getCapitals, getCountries } from '@/api';
import {
  MapConfig,
  MapDefaultConfigs,
  generateStaticSeedParams,
  getSolutions,
} from '@/utils';
import { City, Country } from '@prisma/client';
import { GameParams, formatRegion } from '@/types/routing/dynamicParams';
import { PuzzleGuesserGame, SeedInfo } from '@/types/games';
import PuzzleGuesser from '@/components/games/puzzle/PuzzleGuesser';
import { GeoOutlineData, GeoJsonData } from '@/geoUtils';
import {
  getCityOutlineData,
  getCountryOutlineData,
  getRegionOutlineData,
} from '@/geoBuildUtils';
import { getSeed } from '@/backendUtils';

// In training, there is only a single seed
// The order of the array does not matter, as you have to guess them all in any order
// PuzzleGuesser has no daily mode
export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(
    () => getPuzzleGuesserPossibilities(gp),
    true // Training has a single seed, and daily is not supported. So always generate a single seed
  );
}

async function getPuzzleGuesserPossibilities({
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

export default async function PuzzleGuesserPage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    PuzzleGuesserGame.getSeededHref({ params: params }, newSeed)
  );

  if (params.gamemode === 'daily')
    return <>Puzzle does not have a daily challenge</>;

  const config: GameParams = {
    params: params,
  };

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };

  const possibilities: (Country | City)[] = await getPuzzleGuesserPossibilities(
    {
      params,
    }
  );

  const pieces: GeoOutlineData[] = [];
  const backgroundData: GeoJsonData[] = getRegionOutlineData(params.region);

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = possibilities as Country[];
      const correctCountries: Country[] | undefined = getSolutions(
        config,
        countries,
        seed
      );
      if (!correctCountries) return <>Error! Could not generate the solution</>;
      const countryPuzzlePieces: GeoOutlineData[] = correctCountries.map((c) =>
        getCountryOutlineData(c, true)
      );
      pieces.push(...countryPuzzlePieces);
      break;
    case 'capitals':
      const capitals: City[] = possibilities as City[];
      const correctCapitals: City[] | undefined = getSolutions(
        config,
        capitals,
        seed
      );
      if (!correctCapitals) return <>Error! Could not generate the solution</>;
      const cityPuzzlePieces: GeoOutlineData[] = correctCapitals.map((c) =>
        getCityOutlineData(c)
      );
      pieces.push(...cityPuzzlePieces);
      break;
  }

  const seedInfo: SeedInfo = {
    seed: seed,
    seedCount: params.gamemode === 'training' ? 1 : possibilities.length,
  };

  return (
    <>
      <PuzzleGuesser
        title={`Guess all ${params.feature} in ${formatRegion(params.region)}`}
        feature={params.feature}
        puzzlePieces={pieces}
        backgroundData={backgroundData}
        gameConfig={config}
        mapConfig={mapConfig}
        seedInfo={seedInfo}
      />
    </>
  );
}
