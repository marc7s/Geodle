import { Country, Region } from '@prisma/client';

import { Point } from 'pigeon-maps';
import { GameRegion } from './types/routing/generated/regions';
import { Feature } from './types/routing/dynamicParams';

export interface MapConfig {
  position: Point;
  zoom: number;
}

export const MapDefaultConfigs: {
  World: MapConfig;
  Americas: MapConfig;
  Asia: MapConfig;
  Africa: MapConfig;
  Europe: MapConfig;
  Oceania: MapConfig;
  Antarctic: MapConfig;
  GetConfig: (r: GameRegion) => MapConfig;
} = {
  World: { position: [48, 16], zoom: 3 },
  Americas: { position: [14, -83], zoom: 3 },
  Asia: { position: [20, 80], zoom: 3 },
  Africa: { position: [2, 20], zoom: 3 },
  Europe: { position: [50, 14], zoom: 4 },
  Oceania: { position: [-25, 143], zoom: 3 },
  Antarctic: { position: [-50, 10], zoom: 2 },
  GetConfig: (r) => {
    switch (r) {
      case 'World':
        return MapDefaultConfigs.World;
      case 'Africa':
        return MapDefaultConfigs.Africa;
      case 'Americas':
        return MapDefaultConfigs.Americas;
      case 'Antarctic':
        return MapDefaultConfigs.Antarctic;
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
  caseSensitive: boolean = false
) {
  if (!caseSensitive) {
    answer = answer.toLocaleLowerCase();
    correct = correct.toLocaleLowerCase();
  }

  return answer === correct;
}

// Returns a powerset, i.e. all possible combinations of the elements in the provided array
// However, the result is not a 2D-array, but instead an array of &-joined parameters
// As an example, `getAllParamCombinations(['1', '2'])` would return:
// ['1', '1&2', '2']
export function getAllParamCombinations(arr: string[]) {
  arr = arr.sort();
  const set = [];
  const listSize = arr.length;
  const combinationsCount = 1 << listSize;

  for (let i = 1; i < combinationsCount; i++) {
    const combination = [];
    for (let j = 0; j < listSize; j++) {
      if (i & (1 << j)) combination.push(arr[j]);
    }
    set.push(combination);
  }
  return set.map((combs) => combs.join('&'));
}

export function generateStaticFeatureParams(...allowedFeatures: Feature[]) {
  return allowedFeatures.map((f) => {
    return { feature: f };
  });
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
