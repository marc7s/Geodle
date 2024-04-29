import { getCountries } from '@/api';
import { arrayGetRandomElement, generateStaticFeatureParams } from '@/utils';
import { Country } from '@prisma/client';
import { GameParams, formatRegion } from '@/types/routing/dynamicParams';
import CountryGuesser from '@/components/games/countryGuess/CountryGuesser';

// CountryGuessGame only supports countries
export async function generateStaticParams() {
  return generateStaticFeatureParams('countries');
}

export default async function CountryGuessPage({ params }: GameParams) {
  const countries: Country[] = await getCountries(params.region);
  const dropdownCountries: Country[] = await getCountries('World');
  const correctCountry: Country | undefined = arrayGetRandomElement(countries);

  if (!correctCountry)
    return <>Error! Could not generate the correct country</>;

  function getAllowedGuesses(): number {
    switch (params.region) {
      case 'World':
        return 10;
      case 'Africa':
        return 8;
      case 'Americas':
        return 6;
      case 'Antarctic':
        return 2;
      case 'Asia':
        return 8;
      case 'Europe':
        return 7;
      case 'Oceania':
        return 5;
    }
  }

  return (
    <>
      <CountryGuesser
        title={`Guess the country in ${formatRegion(params.region)}`}
        allowedGuesses={getAllowedGuesses()}
        countries={countries}
        dropdownCountries={dropdownCountries}
        correctCountry={correctCountry}
      ></CountryGuesser>
    </>
  );
}
