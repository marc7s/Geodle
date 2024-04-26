import { Country, Region } from '@prisma/client';

import { Point } from 'pigeon-maps';

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
  GetConfig: (r: Region | 'World') => MapConfig;
} = {
  World: { position: [48, 16], zoom: 3 },
  Americas: { position: [14, -83], zoom: 3 },
  Asia: { position: [20, 80], zoom: 3 },
  Africa: { position: [2, 20], zoom: 3 },
  Europe: { position: [50, 14], zoom: 4 },
  Oceania: { position: [-25, 143], zoom: 3 },
  Antarctic: { position: [-50, 10], zoom: 2 },
  GetConfig: (r) => {
    if (r === 'World') return MapDefaultConfigs.World;

    switch (r.name) {
      case 'Americas':
        return MapDefaultConfigs.Americas;
      case 'Asia':
        return MapDefaultConfigs.Asia;
      case 'Africa':
        return MapDefaultConfigs.Africa;
      case 'Europe':
        return MapDefaultConfigs.Europe;
      case 'Oceania':
        return MapDefaultConfigs.Oceania;
      case 'Antarctic':
        return MapDefaultConfigs.Antarctic;
      default:
        return MapDefaultConfigs.World;
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

export function getFormattedRelativeTime(date: Date) {
  return getFormattedElapsedTime(Date.now() - date.valueOf());
}

// Returns a formatted string of relative elapsed time
// Examples: '3 seconds', '3 hours 12 minutes', '24 minutes 1 second'
export function getFormattedElapsedTime(elapsedMS: number) {
  if (isNaN(elapsedMS)) return 'NaN';

  type TU = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';
  type RTU = [TU, number];

  let unit: RTU | undefined = undefined;
  let lowerUnit: RTU | undefined = undefined;

  const unitDiffs: RTU[] = [
    ['years', 60 * 60 * 24 * 365],
    ['months', 60 * 60 * 24 * 30],
    ['days', 60 * 60 * 24],
    ['hours', 60 * 60],
    ['minutes', 60],
    ['seconds', 1],
  ];

  function getUnitAmount(amountMS: number, [_, secondsInUnit]: RTU) {
    return Math.max(0, Math.round(amountMS / 1000 / secondsInUnit));
  }

  function formatAmountAndUnit(amountMS: number, unit: RTU): string {
    const [timeUnit, _] = unit;
    const unitAmount: number = getUnitAmount(amountMS, unit);
    return `${unitAmount} ${unitAmount == 1 ? timeUnit.slice(0, -1) : timeUnit}`;
  }

  for (const uDiff of unitDiffs) {
    const timeUnit = uDiff[0];

    // If we found the unit in the last iteration, we are now at the lower unit
    if (unit !== undefined) {
      lowerUnit = uDiff;
      break;
    }

    // If we have reached a small enough unit, or we are at the smallest unit
    if (
      getUnitAmount(elapsedMS, uDiff) > 0 ||
      timeUnit === unitDiffs[unitDiffs.length - 1][0]
    ) {
      unit = uDiff;
    }
  }

  // Fallback to seconds
  if (unit === undefined) return `${elapsedMS / 1000} seconds`;

  return `${formatAmountAndUnit(elapsedMS, unit)}${lowerUnit === undefined ? '' : ' ' + formatAmountAndUnit(elapsedMS - 1000 * getUnitAmount(elapsedMS, unit) * unit[1], lowerUnit)}`;
}

export function getFlagURL(country: Country): string {
  return `https://raw.githubusercontent.com/marc7s/countries/master/data/${country.iso3Code.toLocaleLowerCase()}.svg`;
}

export function prismaDecodeStringList(str: string): string[] {
  return str.split(';');
}

export function arrayShuffle(arr: any[]) {
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

export function arrayTake(arr: any[], n: number) {
  if (arr.length <= 0 || n <= 0) return undefined;

  return arr.slice(0, n);
}

export function arrayGetRandomElement(arr: any[]) {
  if (arr.length <= 0) return undefined;

  return arr[Math.floor(Math.random() * arr.length)];
}

export function arrayGetNRandomElements(arr: any[], n: number) {
  return arrayTake(arrayShuffle(arr), n);
}

export function arrayPartition<T>(arr: T[], fun: (_: T) => boolean) {
  const pass: T[] = [],
    fail: T[] = [];
  arr.forEach((e) => (fun(e) ? pass : fail).push(e));
  return [pass, fail];
}
