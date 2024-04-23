import { SeedCoordinate, SeedPopulation } from './interfaces';

export interface SeedCity {
  englishName: string;
  domesticName?: string;
  aliases: string[];
  countryEnglishName: string;
  population: SeedPopulation;
  coordinates: SeedCoordinate;
}

export const SeedCities: SeedCity[] = [
  {
    englishName: 'Gothenburg',
    domesticName: 'Göteborg',
    aliases: [],
    countryEnglishName: 'Sweden',
    population: {
      count: 600_559,
      year: 2023,
    },
    coordinates: {
      lat: 57.70887,
      long: 11.97456,
    },
  },
];
