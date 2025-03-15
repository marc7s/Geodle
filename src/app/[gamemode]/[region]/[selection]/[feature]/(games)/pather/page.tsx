import { CountryPath, getCountries, getCountryPaths } from '@/api';
import {
  MapConfig,
  MapDefaultConfigs,
  generateStaticFeatureParams,
  getSolution,
} from '@/utils';
import { Country } from '@prisma/client';
import { GameParams } from '@/types/routing/dynamicParams';
import { PatherGame } from '@/types/games';
import { GeoJsonData, GeoOutlineData } from '@/geoUtils';
import { getCountryOutlineData, getRegionOutlineData } from '@/geoBuildUtils';
import Pather from '@/components/games/pather/Pather';

export interface PatherPiece {
  country: Country;
  outline: GeoOutlineData;
}

export async function generateStaticParams() {
  return generateStaticFeatureParams(...PatherGame.allowedFeatures);
}

export default async function PatherPage({ params }: GameParams) {
  const config: GameParams = {
    params: params,
  };

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };

  const pieces: PatherPiece[] = [];
  const bestPieces: GeoOutlineData[] = [];
  const backgroundData: GeoJsonData[] = getRegionOutlineData(params.region);

  let solution: CountryPath | undefined = undefined;

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );

      // Get all paths
      const paths: CountryPath[] = await getCountryPaths(
        params.selection,
        params.region
      );

      // Since the paths are bidirectional, we can double the number of possible paths by reversing each path
      const directionalPaths: CountryPath[] = [
        ...paths,
        ...paths.map((p) => {
          return {
            country1: p.country2,
            country2: p.country1,
            paths: p.paths.map((p) => p.reverse()),
          };
        }),
      ];

      solution = getSolution(PatherGame, config, directionalPaths);

      if (!solution) return <>No solution found</>;

      // Create pieces for each country
      const countryPuzzlePieces: PatherPiece[] = countries.map((c) => {
        return { country: c, outline: getCountryOutlineData(c, true) };
      });
      pieces.push(...countryPuzzlePieces);

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
          gameConfig={config}
          mapConfig={mapConfig}
        />
      )}
    </>
  );
}
