import { GameRegion } from './generated/regions';

// Define a custom type for the possible Game Modes
export const gameModes = ['training', 'daily'] as const;
export type GameMode = (typeof gameModes)[number];

// Define a custom type for the possible Features
export const features = ['capitals', 'countries'] as const;
export type Feature = (typeof features)[number];

// Define a custom type for the possible attributes of a feature
export const attributes = ['name', 'capital', 'flag'] as const;
export type Attribute = (typeof attributes)[number];

interface GameParamObject {
  gamemode: GameMode;
  region: GameRegion;
  feature: Feature;
}

interface CompleteGameParamObject extends GameParamObject {
  known: Attribute;
  guess: Attribute;
}

export interface GameParams {
  params: GameParamObject;
}

export interface CompleteGameParams extends GameParamObject {
  params: CompleteGameParamObject;
}
