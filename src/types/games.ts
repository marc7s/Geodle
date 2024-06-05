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

  private separator: string = '&';

  encodeAttributes(attributes: string[]): string {
    return attributes.join(this.separator);
  }

  decodeAttributes(attributes: string): string[] {
    return decodeURIComponent(attributes).split(this.separator);
  }

  // We need more information to be able to generate the href, so we override the base method and make it throw an error if used
  getHref(_: GameParams): string {
    throw new Error('Do not call this, call getCompleterHref() instead');
  }

  getCompleterHref(
    gameParams: GameParams,
    knownAttributes: Attribute[],
    guessAttributes: Attribute[]
  ): string {
    return `${super.getHref(gameParams)}/${knownAttributes.sort().join(this.separator)}/${guessAttributes.sort().join(this.separator)}`;
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
      allowedKnownAttributes.map((a) => a),
      this.separator
    );
    this.guessAttributeCombinations = getAllParamCombinations(
      allowedGuessAttributes.map((a) => a),
      this.separator
    );
  }
}

export const PointGuesserGame: Game = new Game({
  displayName: 'Point Guesser',
  linkName: 'point-guesser',
  description: 'Guess the points marked in the map',
  allowedFeatures: features,
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

export const PuzzleGuesserGame: Game = new Game({
  displayName: 'Puzzle Guesser',
  linkName: 'puzzle',
  description: 'Guess all missing puzzle pieces',
  allowedFeatures: features,
});

export const OutlinerGame: Game = new Game({
  displayName: 'Outliner',
  linkName: 'outliner',
  description: 'Guess the answer based on its outline',
  allowedFeatures: ['countries'],
});

export const games: Game[] = [
  PointGuesserGame,
  CompleterGame,
  GeodleGame,
  TrailGuesserGame,
  PuzzleGuesserGame,
  OutlinerGame,
];
