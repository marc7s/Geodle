export interface Game {
  displayName: string;
  linkName: string;
  description: string;
  additionalParameters?: string;
}

export const CityGuesserGame: Game = {
  displayName: 'City Guesser',
  linkName: 'city-guesser',
  description: 'Guess the cities marked in the map',
};

export const CompleterGame: Game = {
  displayName: 'Completer',
  linkName: 'completer',
  description: 'Complete the missing information',
};

export const GeodleGame: Game = {
  displayName: 'Geodle',
  linkName: 'geodle',
  description: 'A Wordle variant, but you have to guess a country or capital',
};

export const TrailGuesserGame: Game = {
  displayName: 'Trail Guesser',
  linkName: 'trail-guesser',
  description: 'Every guess guides you toward the correct answer',
};

export const Games: Game[] = [
  CityGuesserGame,
  CompleterGame,
  GeodleGame,
  TrailGuesserGame,
];
