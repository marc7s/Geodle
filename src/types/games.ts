import { getAllParamCombinations } from '@/utils';
import {
  Attribute,
  CountrySelection,
  Feature,
  GameMode,
  GameParams,
  attributes,
  countrySelections,
  features,
  gameModes,
} from './routing/dynamicParams';
import { GameRegion, gameRegions } from './routing/generated/regions';

interface GameBase {
  displayName: string;
  linkName: string;
  description: string;
  allowedFeatures: readonly Feature[];
}

export class Game {
  readonly displayName: string;
  readonly linkName: string;
  readonly description: string;

  readonly allowedGameModes: readonly GameMode[] = gameModes;
  readonly allowedRegions: readonly GameRegion[] = gameRegions;
  readonly allowedSelections: readonly CountrySelection[] = countrySelections;
  readonly allowedFeatures: readonly Feature[];

  getHref({ params }: GameParams): string {
    return `/${params.gamemode}/${params.region}/${params.selection}/${params.feature}/${this.linkName}`;
  }

  constructor(base: GameBase) {
    this.displayName = base.displayName;
    this.linkName = base.linkName;
    this.description = base.description;
    this.allowedFeatures = base.allowedFeatures;
  }
}

class CompleterGameClass extends Game {
  readonly allowedKnownAttributes: readonly Attribute[];
  readonly allowedGuessAttributes: readonly Attribute[];
  readonly knownAttributeCombinations: Map<Attribute[], string>;
  readonly guessAttributeCombinations: Map<Attribute[], string>;

  // We need more information to be able to generate the href, so we override the base method and make it throw an error if used
  getHref(_: GameParams): string {
    throw new Error('Do not call this, call getCompleterHref() instead');
  }

  getCompleterHref(
    gameParams: GameParams,
    knownAttributes: Attribute[],
    guessAttributes: Attribute[]
  ): string {
    return `${super.getHref(gameParams)}/${knownAttributes.sort().join('&')}/${guessAttributes.sort().join('&')}`;
  }

  constructor(
    base: GameBase,
    allowedKnownAttributes: readonly Attribute[],
    allowedGuessAttributes: readonly Attribute[]
  ) {
    super(base);
    this.allowedKnownAttributes = allowedKnownAttributes;
    this.allowedGuessAttributes = allowedGuessAttributes;

    this.knownAttributeCombinations = getAllParamCombinations(
      allowedKnownAttributes.map((a) => a)
    );
    this.guessAttributeCombinations = getAllParamCombinations(
      allowedGuessAttributes.map((a) => a)
    );
  }
}

export const CityGuesserGame: Game = new Game({
  displayName: 'City Guesser',
  linkName: 'city-guesser',
  description: 'Guess the cities marked in the map',
  allowedFeatures: ['capitals'],
});

export const CompleterGame: CompleterGameClass = new CompleterGameClass(
  {
    displayName: 'Completer',
    linkName: 'completer',
    description: 'Complete the missing information',
    allowedFeatures: features,
  },
  attributes,
  attributes
);

export const GeodleGame: Game = new Game({
  displayName: 'Geodle',
  linkName: 'geodle',
  description: 'A Wordle variant, but you have to guess a country or capital',
  allowedFeatures: features,
});

export const TrailGuesserGame: Game = new Game({
  displayName: 'Trail Guesser',
  linkName: 'trail-guesser',
  description: 'Every guess guides you toward the correct answer',
  allowedFeatures: features,
});

export const games: Game[] = [
  CityGuesserGame,
  CompleterGame,
  GeodleGame,
  TrailGuesserGame,
];
