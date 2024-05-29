import { getCapitals, getCountries } from '@/api';
import {
  MapDefaultConfigs,
  generateStaticFeatureParams,
  getSolutions,
} from '@/utils';
import { City, Country } from '@prisma/client';
import {
  GameParams,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { PuzzleGuesserGame } from '@/types/games';
import PuzzleGuesser from '@/components/games/puzzle/PuzzleGuesser';
import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { gameRegions } from '@/types/routing/generated/regions';

// PuzzleGuesser supports countries and capitals
export async function generateStaticParams() {
  return generateStaticFeatureParams('countries', 'capitals');
}

export type GeoJsonData = object;

export interface PuzzlePiece {
  name: string;
  answers: string[];
  outline: GeoJsonData;
  guessed?: boolean;
}

// Creates a custom GeoJsonData object for displaying a circle at a given lat/long
function createPointOutline(lat: number, long: number): GeoJsonData {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [long, lat] },
      },
    ],
  };
}

const geoDataBasePath: string = join(process.cwd(), 'src/data/generated/geo');

const countryOutlinePaths: string[] = readdirSync(
  join(geoDataBasePath, 'countries')
).filter((p) => p.match(/[A-Z]{2}\.min\.json/));

const regionOutlinePaths: string[] = readdirSync(
  join(geoDataBasePath, 'regions')
).filter((p) => p.match(/\w+\.min\.json/));

// Converts a Country into a PuzzlePiece
function countryToPuzzlePiece(country: Country): PuzzlePiece {
  const countryOutlinePath = countryOutlinePaths.find(
    (p) => p === `${country.iso2Code}.min.json`
  );

  // Return the parsed data if it exists, otherwise create a point for the country
  const countryOutline: GeoJsonData = countryOutlinePath
    ? JSON.parse(
        readFileSync(
          join(geoDataBasePath, 'countries', countryOutlinePath)
        ).toString()
      )
    : createPointOutline(country.lat, country.long);

  return {
    name: country.englishShortName,
    answers: [country.englishShortName],
    outline: countryOutline,
  };
}

// Converts a City into a PuzzlePiece
function cityToPuzzlePiece(city: City): PuzzlePiece {
  return {
    name: city.englishName,
    answers: [city.englishName],
    outline: createPointOutline(city.lat, city.long),
  };
}

export default async function PuzzleGuesserPage({ params }: GameParams) {
  const config: GameParams = {
    params: params,
  };

  const mapConfig = MapDefaultConfigs.GetConfig(params.region);

  const pieces: PuzzlePiece[] = [];
  const backgroundData: GeoJsonData[] = (
    params.region === 'World' ? gameRegions : [params.region]
  )
    .filter((r) => r !== 'World') // 'World' is not a region
    .map((r) => {
      const regionOutlinePath = regionOutlinePaths.find(
        (p) => p === `${r}.min.json`
      );
      if (!regionOutlinePath)
        throw new Error(`Could not find region outline for ${r}`);
      return JSON.parse(
        readFileSync(
          join(geoDataBasePath, 'regions', regionOutlinePath)
        ).toString()
      );
    });

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
      const countryPuzzlePieces: PuzzlePiece[] = correctCountries.map((c) =>
        countryToPuzzlePiece(c)
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
      const cityPuzzlePieces: PuzzlePiece[] = correctCapitals.map((c) =>
        cityToPuzzlePiece(c)
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
