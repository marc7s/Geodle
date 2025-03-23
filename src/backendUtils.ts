import { Presets, SingleBar } from 'cli-progress';
import { GameParams } from './types/routing/dynamicParams';
import { permanentRedirect } from 'next/navigation';

export function createConsoleProgressBar(title: string) {
  return new SingleBar(
    {
      format: `${title} [{bar}] {percentage}% | {value}/{total} | Elapsed: {duration_formatted} | ETA: {eta_formatted}`,
    },
    Presets.shades_classic
  );
}

export function prismaEncodeStringList(str: string[]): string {
  // There is a limit to the string length, so we only encode the first N elements, so that the total size is below a threshold
  return str.reduce((acc, curr) => (acc.length > 500 ? acc : acc + curr), '');
}

function parseSeedFromGameParams({ params }: GameParams): number | undefined {
  if (!params.seed || params.seed.length === 0) return undefined;
  const parsedSeed: number = parseInt(params.seed[0]);
  return Number.isNaN(parsedSeed) ? undefined : parsedSeed;
}

/**
 *
 * Run server-side, to get the seed from the game parameters
 * Redirects to a seeded URL if the seed is undefined
 */
export function getSeed(
  gameParams: GameParams,
  seededHrefFunction: (seed: number | undefined) => string
): number {
  const seed: number | undefined = parseSeedFromGameParams(gameParams);
  if (seed === undefined) permanentRedirect(seededHrefFunction(0));

  return seed;
}
