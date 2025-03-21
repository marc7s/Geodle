import { getCountries } from '@/api';
import { generateStaticSeedParams, getSolution } from '@/utils';
import { Country } from '@prisma/client';
import {
  GameParams,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { OutlinerGame, SeedInfo } from '@/types/games';
import { GeoOutlineData } from '@/geoUtils';
import Outliner from '@/components/games/outliner/Outliner';
import { getCountryOutlineData } from '@/geoBuildUtils';
import { getSeed } from '@/backendUtils';

export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(() => getOutlinerPossibilities(gp));
}

async function getOutlinerPossibilities({
  params,
}: GameParams): Promise<Country[]> {
  return await getCountries(params.selection, params.region);
}

export default async function OutlinerPage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    OutlinerGame.getSeededHref({ params: params }, newSeed)
  );

  const config: GameParams = {
    params: params,
  };

  const singularFeature: string = formatSingularFeature(params.feature);

  let solution: GeoOutlineData | undefined = undefined;
  let seedInfo: SeedInfo | undefined = undefined;
  const possibleGuesses: string[] = [];

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );
      const correctCountry: Country | undefined = getSolution(countries, seed);
      if (!correctCountry) return <>Error! Could not generate the solution</>;
      solution = getCountryOutlineData(correctCountry, false, false);
      possibleGuesses.push(...countries.map((c) => c.englishShortName));
      seedInfo = {
        seed: seed,
        seedCount: countries.length,
      };
      break;
    case 'capitals':
      return <>Outliner does not support capitals</>;
  }

  return (
    <>
      {solution && (
        <Outliner
          title={`Guess the ${singularFeature} based on its outline`}
          feature={params.feature}
          allowedGuesses={3}
          answer={solution}
          possibleAnswers={possibleGuesses}
          gameConfig={config}
          mapConfig={{
            position: solution.center,
            zoom: solution.zoomLevelToFit,
          }}
          seedInfo={seedInfo}
        />
      )}
    </>
  );
}
