import { getCountries } from '@/api';
import { generateStaticFeatureParams, getSolution } from '@/utils';
import { Country } from '@prisma/client';
import {
  GameParams,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import Geodle from '@/components/games/geodle/Geodle';

// GeodleGame supports countries and capitals
export async function generateStaticParams() {
  return generateStaticFeatureParams('countries', 'capitals');
}

export default async function GeodlePage({ params }: GameParams) {
  const countries: Country[] = await getCountries(params.region);
  const correctCountry: Country | undefined = getSolution(
    {
      game: 'Geodle',
      gameMode: params.gamemode,
      region: params.region,
      feature: params.feature,
    },
    countries
  );

  if (!correctCountry)
    return <>Error! Could not generate the correct country</>;

  function getAllowedGuesses(): number {
    switch (params.region) {
      case 'World':
        return 6;
      case 'Africa':
        return 5;
      case 'Americas':
        return 4;
      case 'Asia':
        return 5;
      case 'Europe':
        return 4;
      case 'Oceania':
        return 3;
    }
  }

  return (
    <>
      <Geodle
        title={`Guess the ${formatSingularFeature(params.feature)} in ${formatRegion(params.region)}`}
        correct={correctCountry.englishShortName}
        allowedGuessCount={getAllowedGuesses()}
        allowedGuesses={countries.map((c) => c.englishShortName)}
      ></Geodle>
    </>
  );
}
