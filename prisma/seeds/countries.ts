import { SeedCity } from './cities';
import { SeedCoordinate, SeedPopulation } from './interfaces';

export interface SeedCountry {
  englishShortName: string;
  englishLongName?: string;
  domesticName: string;
  aliases: string[];
  population: SeedPopulation;
  coordinates: SeedCoordinate;
  capital: SeedCity;
}

export const SeedCountries: SeedCountry[] = [
  {
    englishShortName: 'Sweden',
    domesticName: 'Sverige',
    aliases: [],
    population: {
      count: 10_661_715,
      year: 2024,
    },
    coordinates: {
      lat: 60.128161,
      long: 18.643501,
    },
    capital: {
      englishName: 'Stockholm',
      aliases: [],
      countryEnglishName: 'Sweden',
      population: {
        count: 975_551,
        year: 2020,
      },
      coordinates: {
        lat: 59.334591,
        long: 18.06324,
      },
    },
  },
  {
    englishShortName: 'Norway',
    domesticName: 'Norge',
    aliases: [],
    population: {
      count: 5_488_984,
      year: 2023,
    },
    coordinates: {
      lat: 64.583013,
      long: 17.86411,
    },
    capital: {
      englishName: 'Oslo',
      aliases: [],
      countryEnglishName: 'Norway',
      population: {
        count: 709_037,
        year: 2022,
      },
      coordinates: {
        lat: 59.911491,
        long: 10.757933,
      },
    },
  },
];
