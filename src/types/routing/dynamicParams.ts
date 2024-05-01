import { GameRegion } from './generated/regions';

// Define a custom type for the possible Game Modes
export const gameModes = ['training', 'daily'] as const;
export type GameMode = (typeof gameModes)[number];

// Define a custom type for the possible Features
export const features = ['capitals', 'countries'] as const;
export type Feature = (typeof features)[number];

export function formatSingularFeature(feature: Feature): string {
  switch (feature) {
    case 'countries':
      return 'country';
    case 'capitals':
      return 'capital';
  }
}

export function formatRegion(region: GameRegion): string {
  switch (region) {
    case 'Africa':
    case 'Asia':
    case 'Europe':
    case 'Oceania':
      return region;
    case 'Americas':
    case 'Antarctic':
    case 'World':
      return `the ${region}`;
  }
}

// Define a custom type for the possible attributes of a feature
export const attributes = ['capital', 'name', 'flag'] as const;
export type Attribute = (typeof attributes)[number];

interface GameParamObject {
  gamemode: GameMode;
  region: GameRegion;
  feature: Feature;
}

export interface CompleteGameParams extends GameParamObject {
  knownAttributes: string;
  guessAttributes: string;
}

export interface GameParams {
  params: GameParamObject;
}
