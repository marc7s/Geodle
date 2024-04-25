import { Country, Region } from '@prisma/client';
import { Presets, SingleBar } from 'cli-progress';
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

export function createConsoleProgressBar(title: string) {
  return new SingleBar(
    {
      format: `${title} [{bar}] {percentage}% | {value}/{total} | Elapsed: {duration_formatted} | ETA: {eta_formatted}`,
    },
    Presets.shades_classic
  );
}

export function getFlagURL(country: Country): string {
  return `https://raw.githubusercontent.com/marc7s/countries/master/data/${country.iso3Code.toLocaleLowerCase()}.svg`;
}

export function prismaEncodeStringList(str: string[]): string {
  // There is a limit to the string length, so we only encode the first N elements, so that the total size is below a threshold
  return str.reduce((acc, curr) => (acc.length > 500 ? acc : acc + curr), '');
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
