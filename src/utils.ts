import { Country } from '@prisma/client';

import { Point } from 'pigeon-maps';
import { GameRegion } from './types/routing/generated/regions';
import { Feature, GameParams } from './types/routing/dynamicParams';
import { Game } from './types/games';
import { sha256Base64 } from './sha256';

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

// Letters that do not decompose into a base letter and diacritics
const plainLetters: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  đ: 'd',
  ð: 'd',
  þ: 'th',
  ł: 'l',
  ı: 'i',
  ħ: 'h',
  ŋ: 'n',
  ŧ: 't',
  ĸ: 'k',
  ŀ: 'l',
  ſ: 's',
  ə: 'e',
  ǝ: 'e',
  ɛ: 'e',
  ɩ: 'i',
  ɔ: 'o',
  ɵ: 'o',
  ɣ: 'g',
  ȝ: 'y',
  '’': "'",
  '‘': "'",
  ʼ: "'",
  '´': "'",
  '`': "'",
};

// Removes diacritics, e.g. "Curaçao" becomes "Curacao", so answers can be typed without them
// A lightweight replacement for `unidecode`, whose transliteration tables for every script would be
// shipped to every page. All answers are in the Latin script, so this gives the same result for them
export function toPlainLatin(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\x00-\x7f]/g, (c) => plainLetters[c] ?? c);
}

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
    answer = toPlainLatin(answer);
    correct = toPlainLatin(correct);
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

// Returns why the game cannot be played with these settings, or undefined if it can
export function getUnsupportedReason(
  game: Game,
  { params }: GameParams
): string | undefined {
  if (!game.allowedFeatures.includes(params.feature))
    return `${game.displayName} does not support ${params.feature}`;
  if (params.gamemode === 'daily' && !game.supportsDailyMode)
    return `${game.displayName} does not have a daily challenge`;
  return undefined;
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
  const dateHash: string = sha256Base64(identifier);

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
export function countryBorders(
  country1: Pick<Country, 'bordersISO3'>,
  country2: Pick<Country, 'iso3Code'>
): boolean {
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
