import { getAllParamCombinations } from '@/utils';
import {
  Attribute,
  CompleteGameParams,
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
  supportsDailyMode: boolean;
}

export interface SeedInfo {
  seed: number;
  seedCount: number;
}

export class Game {
  readonly displayName: string;
  readonly linkName: string;
  readonly description: string;

  readonly allowedGameModes: readonly GameMode[] = gameModes;
  readonly allowedRegions: readonly GameRegion[] = gameRegions;
  readonly allowedSelections: readonly CountrySelection[] = countrySelections;
  readonly allowedFeatures: readonly Feature[];
  readonly supportsDailyMode: boolean;

  // Get a random seed, out of the available ones
  protected getRandomSeed(seedInfo: SeedInfo): number {
    return Math.floor(Math.random() * seedInfo.seedCount) + 1;
  }

  getHref({ params }: GameParams): string {
    return `/${params.gamemode}/${params.region}/${params.selection}/${params.feature}/${this.linkName}`;
  }

  getSeededHref({ params }: GameParams, seed: number | undefined): string {
    const seedSlug: string = (seed ?? 0).toString();
    return `${this.getHref({ params })}/${seedSlug}`;
  }

  getRandomSeededHref({ params }: GameParams, seedInfo: SeedInfo): string {
    return this.getSeededHref({ params }, this.getRandomSeed(seedInfo));
  }

  constructor(base: GameBase) {
    this.displayName = base.displayName;
    this.linkName = base.linkName;
    this.description = base.description;
    this.allowedFeatures = base.allowedFeatures;
    this.supportsDailyMode = base.supportsDailyMode;
  }
}

class CompleterGameClass extends Game {
  readonly allowedKnownAttributes: readonly Attribute[];
  readonly allowedGuessAttributes: readonly Attribute[];
  readonly knownAttributeCombinations: Map<Attribute[], string>;
  readonly guessAttributeCombinations: Map<Attribute[], string>;

  public readonly separator: string = '&';

  encodeAttributes(attributes: string[]): string {
    return attributes.join(this.separator);
  }

  decodeAttributes(attributes: string): string[] {
    return decodeURIComponent(attributes).split(this.separator);
  }

  convertParams(completeParams: CompleteGameParams): GameParams {
    return {
      params: {
        gamemode: completeParams.gamemode,
        region: completeParams.region,
        selection: completeParams.selection,
        feature: completeParams.feature,
        seed: completeParams.seed,
      },
    };
  }

  // *** We need more information to be able to generate the href, so we override the base method and make it throw an error if used ***
  getHref(_: GameParams): string {
    throw new Error('Do not call this, call getCompleterHref() instead');
  }

  getSeededHref(_: GameParams, __: number | undefined): string {
    throw new Error('Do not call this, call getCompleterSeededHref() instead');
  }

  getRandomSeededHref(_: GameParams, __: SeedInfo): string {
    throw new Error(
      'Do not call this, call getCompleterRandomSeededHref() instead'
    );
  }
  // ******

  getCompleterHref(params: CompleteGameParams): string {
    const knownAttributes: Attribute[] = params.knownAttributes.split(
      this.separator
    ) as Attribute[];
    const guessAttributes: Attribute[] = params.guessAttributes.split(
      this.separator
    ) as Attribute[];
    return `${super.getHref(this.convertParams(params))}/${knownAttributes.sort().join(this.separator)}/${guessAttributes.sort().join(this.separator)}`;
  }

  getCompleterSeededHref(
    params: CompleteGameParams,
    seed: number | undefined
  ): string {
    const seedSlug: string = (seed ?? 0).toString();

    return `${this.getCompleterHref(params)}/${seedSlug}`;
  }

  getCompleterRandomSeededHref(
    params: CompleteGameParams,
    seedInfo: SeedInfo
  ): string {
    return this.getCompleterSeededHref(params, this.getRandomSeed(seedInfo));
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
  supportsDailyMode: true,
});

export const CompleterGame: CompleterGameClass = new CompleterGameClass(
  {
    displayName: 'Completer',
    linkName: 'completer',
    description: 'Complete the missing information',
    allowedFeatures: features,
    supportsDailyMode: true,
  },
  attributes,
  attributes
);

export const GeodleGame: Game = new Game({
  displayName: 'Geodle',
  linkName: 'geodle',
  description: 'A Wordle variant, but you have to guess a country or capital',
  allowedFeatures: features,
  supportsDailyMode: true,
});

export const TrailGuesserGame: Game = new Game({
  displayName: 'Trail Guesser',
  linkName: 'trail-guesser',
  description: 'Every guess guides you toward the correct answer',
  allowedFeatures: features,
  supportsDailyMode: true,
});

export const PuzzleGuesserGame: Game = new Game({
  displayName: 'Puzzle Guesser',
  linkName: 'puzzle',
  description: 'Guess all missing puzzle pieces',
  allowedFeatures: features,
  supportsDailyMode: false,
});

export const OutlinerGame: Game = new Game({
  displayName: 'Outliner',
  linkName: 'outliner',
  description: 'Guess the answer based on its outline',
  allowedFeatures: ['countries'],
  supportsDailyMode: true,
});

export const PatherGame: Game = new Game({
  displayName: 'Pather',
  linkName: 'pather',
  description: 'Guess the shortest path between countries',
  allowedFeatures: ['countries'],
  supportsDailyMode: true,
});

export const games: Game[] = [
  PointGuesserGame,
  CompleterGame,
  GeodleGame,
  TrailGuesserGame,
  PuzzleGuesserGame,
  OutlinerGame,
  PatherGame,
];
