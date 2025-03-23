import { Country } from '@prisma/client';

import { Point } from 'pigeon-maps';
import { GameRegion } from './types/routing/generated/regions';
import { Feature, GameParams } from './types/routing/dynamicParams';
import { createHash } from 'crypto';
import { Game, SeedInfo } from './types/games';
import { redirect } from 'next/navigation';
import {
  OPT_DEBUG_DISABLE_GAME_SEED_GENERATION,
  OPT_DEBUG_ISOLATE_BUILD_TO_GAME,
} from './optimizations';
const unidecode = require('unidecode');

export type DailyGameAdditionalConfig = { [key: string]: string };

export interface MapConfig {
  position: Point;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

export const MapDefaultConfigs: {
  World: MapConfig;
  Americas: MapConfig;
  Asia: MapConfig;
  Africa: MapConfig;
  Europe: MapConfig;
  Oceania: MapConfig;
  GetConfig: (r: GameRegion) => MapConfig;
} = {
  World: { position: [48, 16], zoom: 3 },
  Americas: { position: [14, -83], zoom: 3 },
  Asia: { position: [20, 80], zoom: 3 },
  Africa: { position: [2, 20], zoom: 3 },
  Europe: { position: [50, 14], zoom: 4 },
  Oceania: { position: [-25, 143], zoom: 3 },
  GetConfig: (r) => {
    switch (r) {
      case 'World':
        return MapDefaultConfigs.World;
      case 'Africa':
        return MapDefaultConfigs.Africa;
      case 'Americas':
        return MapDefaultConfigs.Americas;
      case 'Asia':
        return MapDefaultConfigs.Asia;
      case 'Europe':
        return MapDefaultConfigs.Europe;
      case 'Oceania':
        return MapDefaultConfigs.Oceania;
    }
  },
};

export function isCorrect(
  answer: string,
  correct: string,
  caseSensitive: boolean = false,
  asciiTranslation: boolean = true
) {
  if (!caseSensitive) {
    answer = answer.toLocaleLowerCase();
    correct = correct.toLocaleLowerCase();
  }

  if (asciiTranslation) {
    answer = unidecode(answer);
    correct = unidecode(correct);
  }

  return answer === correct;
}

// Returns a powerset, i.e. all possible combinations of the elements in the provided array
// However, the result is not a 2D-array, but instead an map with the keys as the parameters for that combination, and the value as the
// separator-joined parameter used in the links
// As an example, `getAllParamCombinations(['1', '2'], '&')` would return (as a map):
// [['1'] => '1', ['1', '2'] => '1&2', ['2'] => '2']
export function getAllParamCombinations<T>(
  arr: T[],
  separator: string
): Map<T[], string> {
  arr = arr.sort();
  const set: Map<T[], string> = new Map();
  const listSize = arr.length;
  const combinationsCount = 1 << listSize;

  for (let i = 1; i < combinationsCount; i++) {
    const combination = [];
    for (let j = 0; j < listSize; j++) {
      if (i & (1 << j)) combination.push(arr[j]);
    }
    set.set(combination, combination.join(separator));
  }
  return set;
}

export function generateStaticFeatureParams(...allowedFeatures: Feature[]) {
  return allowedFeatures.map((f) => {
    return { feature: f };
  });
}

export function handleSeedClientSide(
  seedInfo: SeedInfo,
  game: Game,
  gameParams: GameParams,
  additionalDailyConfig: DailyGameAdditionalConfig,
  seededHrefFunction: (seed: number) => string,
  randomSeededHrefFunction: () => string
): void {
  // If the seed is 0 and the gamemode is training, redirect to a random seed
  if (gameParams.params.gamemode === 'training' && seedInfo.seed === 0)
    redirect(randomSeededHrefFunction());

  // If the seed is 0 and the gamemode is daily, redirect to the current daily seed
  if (gameParams.params.gamemode === 'daily' && seedInfo.seed === 0) {
    const correctSeed: number = getDailySeed(
      seedInfo.seedCount,
      game,
      gameParams,
      new Date(),
      additionalDailyConfig
    );
    redirect(seededHrefFunction(correctSeed));
  }
}

/**
 * Generates static parameters for dynamic routing, based on the possible values
 * @param possibilityFunction Function returning all possible values, from which the seed will decide the solution
 * @param singleSeed If true, only one seed will be generated. This is useful for games where the seed is not used to generate the solution
 */
export async function generateStaticSeedParams<T>(
  possibilityFunction: () => Promise<T[]>,
  game: Game,
  { params }: GameParams,
  singleSeed: boolean = false
) {
  // Debug flag: only build the specified game if building in development and the flag is set
  if (
    process.env.DEV_BUILD === '1' &&
    OPT_DEBUG_ISOLATE_BUILD_TO_GAME !== undefined &&
    OPT_DEBUG_ISOLATE_BUILD_TO_GAME !== game.displayName
  ) {
    return [{ seed: undefined }];
  }

  // Do not generate pages for unsupported features
  if (!game.allowedFeatures.includes(params.feature)) return [];

  // Do not generate daily pages if the game does not support it
  if (params.gamemode === 'daily' && !game.supportsDailyMode) return [];

  const debugDisableSeeding: boolean =
    process.env.DEV_BUILD === '1' &&
    OPT_DEBUG_DISABLE_GAME_SEED_GENERATION.includes(game.displayName);

  const seedCount: number =
    singleSeed || debugDisableSeeding
      ? 1
      : (await possibilityFunction()).length;
  const seedParams = [...Array(seedCount + 1).keys()].map((seed) => {
    return {
      seed: [seed.toString()],
    };
  });

  return [...seedParams, { seed: undefined }];
}

export function getFlagURL(country: Country): string {
  return `https://raw.githubusercontent.com/marc7s/countries/master/data/${country.iso3Code.toLocaleLowerCase()}.svg`;
}

export function prismaDecodeStringList(str: string): string[] {
  return str.split(';');
}

export function getSetValues(...arr: (string | null)[]) {
  const result: string[] = [];
  arr.forEach((v) => {
    if (v) result.push(v);
  });

  return result;
}

export function capitalize(str: string): string {
  if (str.length < 1) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getSolution<T>(
  possibilities: T[],
  seed: number
): T | undefined {
  if (Number.isNaN(seed)) throw new Error('Seed is NaN');
  return arraySeededShuffle(possibilities, seed).at(0);
}

export function getSolutions<T>(
  params: GameParams,
  possibilities: T[],
  seed: number,
  numberOfSolutions?: number
): T[] | undefined {
  switch (params.params.gamemode) {
    case 'daily':
      return arraySeededShuffle(possibilities, seed).slice(0, 1);
    case 'training':
      return arrayShuffle(possibilities).slice(0, numberOfSolutions);
  }
}

export function getDailySolution<T>(
  possibilities: T[],
  game: Game,
  { params }: GameParams,
  additionalConfig: DailyGameAdditionalConfig = {}
): T | undefined {
  if (possibilities.length < 1) return;
  const configID: string = Object.entries(additionalConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('-');
  const identifier: string = `${game.displayName}-${params.region}-${params.selection}-${params.feature}${configID.length > 0 ? '-' + configID : ''}-${new Date().toISOString().split('T')[0]}`;
  const dateHash: string = createHash('sha256')
    .update(identifier)
    .digest('base64');

  const seed: number = dateHash
    .split('')
    .reduce(
      (hashCode, currentVal) =>
        (hashCode =
          currentVal.charCodeAt(0) +
          (hashCode << 6) +
          (hashCode << 16) -
          hashCode),
      0
    );

  return arraySeededShuffle(possibilities, seed).at(0);
}

export function getDailySeed(
  seedCount: number,
  game: Game,
  { params }: GameParams,
  dailyDate: Date = new Date(),
  additionalConfig: DailyGameAdditionalConfig = {}
): number {
  const configID: string = Object.entries(additionalConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('-');
  const identifier: string = `${game.displayName}-${params.region}-${params.selection}-${params.feature}${configID.length > 0 ? '-' + configID : ''}-${dailyDate.toISOString().split('T')[0]}`;
  const dateHash: string = createHash('sha256')
    .update(identifier)
    .digest('base64');

  const seed: number = dateHash
    .split('')
    .reduce(
      (hashCode, currentVal) =>
        (hashCode =
          currentVal.charCodeAt(0) +
          (hashCode << 6) +
          (hashCode << 16) -
          hashCode),
      0
    );

  return (Math.abs(seed) % seedCount) + 1;
}

// Returns true if the two countries share a border
export function countryBorders(country1: Country, country2: Country): boolean {
  return country1.bordersISO3.split(',').includes(country2.iso3Code);
}

// Fisher-Yates shuffle
export function arrayShuffle<T>(arr: T[]) {
  let currentIndex = arr.length;
  let randomIndex = 0;

  // While there are elements left to shuffle
  while (currentIndex != 0) {
    // Pick a random remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
}

// Fisher-Yates shuffle with seed
export function arraySeededShuffle<T>(arr: T[], seed: number): T[] {
  function random(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  let currentIndex = arr.length;
  let randomIndex = 0;

  // While there are elements left to shuffle
  while (currentIndex != 0) {
    // Pick a (seeded) random remaining element
    randomIndex = Math.floor(random(seed) * currentIndex--);

    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
    ++seed;
  }

  return arr;
}

export function arrayTake<T>(arr: T[], n: number) {
  if (arr.length <= 0 || n <= 0) return undefined;

  return arr.slice(0, n);
}

export function arrayGetRandomElement<T>(arr: T[]) {
  if (arr.length <= 0) return undefined;

  return arr[Math.floor(Math.random() * arr.length)];
}

export function arrayGetNRandomElements<T>(arr: T[], n: number) {
  return arrayTake(arrayShuffle(arr), n);
}

export function arrayPartition<T>(arr: T[], fun: (_: T) => boolean) {
  const pass: T[] = [],
    fail: T[] = [];
  arr.forEach((e) => (fun(e) ? pass : fail).push(e));
  return [pass, fail];
}
