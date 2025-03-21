import { getCountries } from '@/api';
import { generateStaticSeedParams, getSolution } from '@/utils';
import { Country } from '@prisma/client';
import {
  GameParams,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import Geodle from '@/components/games/geodle/Geodle';
import { GeodleGame, SeedInfo } from '@/types/games';
import { getSeed } from '@/backendUtils';

export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(() => getGeodlePossibilities(gp));
}

async function getGeodlePossibilities({
  params,
}: GameParams): Promise<Country[]> {
  return await getCountries(params.selection, params.region);
}

export default async function GeodlePage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    GeodleGame.getSeededHref({ params: params }, newSeed)
  );

  const countries = await getGeodlePossibilities({ params: params });
  const correctCountry: Country | undefined = getSolution(countries, seed);

  if (!correctCountry)
    return <>Error! Could not generate the correct country</>;

  const seedInfo: SeedInfo = {
    seed: seed,
    seedCount: countries.length,
  };

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
        gameConfig={{ params: params }}
        seedInfo={seedInfo}
      ></Geodle>
    </>
  );
}
