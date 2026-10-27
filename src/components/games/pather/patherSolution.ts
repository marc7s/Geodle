import { Country } from '@prisma/client';
import { GeoOutlineData } from '@/geoUtils';
import { getSolution } from '@/utils';

// The fields of a country that the game needs
export type PatherCountry = Pick<
  Country,
  'id' | 'iso3Code' | 'englishShortName' | 'bordersISO3'
>;

export interface PatherPiece {
  country: PatherCountry;
  outline: GeoOutlineData;
}

// A possible solution: the shortest paths between two countries, as ISO3 codes
export interface PatherPath {
  country1: string;
  country2: string;
  paths: string[][];
}

export interface PatherSolution {
  title: string;
  allowedGuesses: number;
  startCountry: PatherCountry;
  endCountry: PatherCountry;
  oneBestSolution: string[];
  solutionOutlines: GeoOutlineData[];
  possiblePieces: PatherPiece[];
  bestOutlines: GeoOutlineData[];
}

// Picks the path to guess for a seed, and derives everything the game needs from it
export function getPatherSolution(
  possiblePaths: PatherPath[],
  pieces: PatherPiece[],
  seed: number
): PatherSolution {
  const solution: PatherPath = getSolution([...possiblePaths], seed)!;
  const pieceByIso3: Map<string, PatherPiece> = new Map(
    pieces.map((p) => [p.country.iso3Code, p])
  );
  const start: PatherPiece = pieceByIso3.get(solution.country1)!;
  const end: PatherPiece = pieceByIso3.get(solution.country2)!;
  const isEndpoint = (p: PatherPiece) =>
    p.country.id === start.country.id || p.country.id === end.country.id;

  // Countries outside the region are not part of the pieces, and are skipped
  const shortestPaths: PatherPiece[][] = solution.paths.map((path) =>
    path.flatMap((iso3) => {
      const piece: PatherPiece | undefined = pieceByIso3.get(iso3);
      return piece ? [piece] : [];
    })
  );

  return {
    title: `Guess the countries that connect ${start.country.englishShortName} and ${end.country.englishShortName}`,
    allowedGuesses: Math.ceil((shortestPaths[0].length - 2) * 1.2 + 1),
    startCountry: start.country,
    endCountry: end.country,
    oneBestSolution:
      shortestPaths.at(0)?.map((p) => p.country.englishShortName) ?? [],
    solutionOutlines: [start.outline, end.outline],
    possiblePieces: pieces.filter((p) => !isEndpoint(p)),
    bestOutlines: shortestPaths
      .map((path) => path.filter((p) => !isEndpoint(p)).map((p) => p.outline))
      .flat(),
  };
}
