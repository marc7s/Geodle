import { getCountries, getCountryPaths } from '@/api';
import {
  MapConfig,
  MapDefaultConfigs,
  generateStaticSeedParams,
  getSolution,
} from '@/utils';
import { Country } from '@prisma/client';
import { GameParams } from '@/types/routing/dynamicParams';
import { PatherGame, SeedInfo } from '@/types/games';
import { GeoJsonData, GeoOutlineData } from '@/geoUtils';
import { getCountryOutlineData, getRegionOutlineData } from '@/geoBuildUtils';
import Pather from '@/components/games/pather/Pather';
import { getSeed } from '@/backendUtils';
import { CountryPath } from '@/db';
import { cache } from 'react';
import {
  OPT_PATHER_SKIP_EVERY_N_PATH,
  OPT_PATHER_USE_BIDIRECTIONAL_PATHS,
} from '@/optimizations';

export interface PatherPiece {
  country: Country;
  outline: GeoOutlineData;
}

const getPatherPossibilitiesCached = cache(getPatherPossibilities);

export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(
    () => getPatherPossibilitiesCached(gp),
    PatherGame,
    gp
  );
}

async function getPatherPossibilities({
  params,
}: GameParams): Promise<CountryPath[]> {
  // Get all paths
  const paths: CountryPath[] = (
    await getCountryPaths(params.selection, params.region)
  ).filter(
    (_, i) =>
      OPT_PATHER_SKIP_EVERY_N_PATH !== 0 &&
      i % OPT_PATHER_SKIP_EVERY_N_PATH === 0
  );

  // Since the paths are bidirectional, we can double the number of possible paths by reversing each path
  // This can be disabled for performance reasons, as it doubles the number of endpoints to build
  if (OPT_PATHER_USE_BIDIRECTIONAL_PATHS)
    paths.push(
      ...paths.map((p) => {
        return {
          country1: p.country2,
          country2: p.country1,
          paths: p.paths.map((p) => p.reverse()),
        };
      })
    );

  return paths;
}

const getPatherPiecesCached = cache(getPatherPieces);
async function getPatherPieces({ params }: GameParams): Promise<PatherPiece[]> {
  const countries: Country[] = await getCountries(
    params.selection,
    params.region
  );

  // Create pieces for each country
  return countries.map((c) => {
    return { country: c, outline: getCountryOutlineData(c, true) };
  });
}

export default async function PatherPage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    PatherGame.getSeededHref({ params: params }, newSeed)
  );

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };

  let pieces: PatherPiece[] = [];
  const bestPieces: GeoOutlineData[] = [];
  const backgroundData: GeoJsonData[] = getRegionOutlineData(params.region);

  let solution: CountryPath | undefined = undefined;
  let seedInfo: SeedInfo | undefined = undefined;

  switch (params.feature) {
    case 'countries':
      const directionalPaths: CountryPath[] =
        await getPatherPossibilitiesCached({
          params,
        });
      solution = getSolution(directionalPaths, seed);

      if (!solution) return <>No solution found</>;

      pieces = await getPatherPiecesCached({ params });

      const shortestPathCountryPuzzlePieces: GeoOutlineData[] = solution.paths
        .map((cs) =>
          cs
            .filter(
              (c) => ![solution?.country1, solution?.country2].includes(c)
            )
            .map((c) => getCountryOutlineData(c, true))
        )
        .flat();
      bestPieces.push(...shortestPathCountryPuzzlePieces);

      seedInfo = {
        seed: seed,
        seedCount: directionalPaths.length,
      };
      break;
    case 'capitals':
      return <>Outliner does not support capitals</>;
  }

  return (
    <>
      {solution && (
        <Pather
          title={`Guess the countries that connect ${solution.country1.englishShortName} and ${solution.country2.englishShortName}`}
          feature={params.feature}
          allowedGuesses={Math.ceil((solution.paths[0].length - 2) * 1.2 + 1)}
          startCountry={solution.country1}
          endCountry={solution.country2}
          oneBestSolution={
            solution.paths.at(0)?.map((c) => c.englishShortName) ?? []
          }
          solutionOutlines={[
            getCountryOutlineData(solution.country1, true),
            getCountryOutlineData(solution.country2, true),
          ]}
          possiblePieces={pieces.filter(
            (p) =>
              ![solution.country1.id, solution.country2.id].includes(
                p.country.id
              )
          )}
          bestOutlines={bestPieces}
          backgroundData={backgroundData}
          gameConfig={{ params }}
          mapConfig={mapConfig}
          seedInfo={seedInfo}
        />
      )}
    </>
  );
}
