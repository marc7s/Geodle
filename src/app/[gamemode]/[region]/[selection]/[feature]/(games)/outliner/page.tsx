import { getCountries } from '@/api';
import { generateStaticFeatureParams, getSolution } from '@/utils';
import { Country } from '@prisma/client';
import {
  GameParams,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { OutlinerGame } from '@/types/games';
import { GeoOutlineData } from '@/geoUtils';
import Outliner from '@/components/games/outliner/Outliner';
import { getCountryOutlineData } from '@/geoBuildUtils';

export async function generateStaticParams() {
  return generateStaticFeatureParams(...OutlinerGame.allowedFeatures);
}

export default async function OutlinerPage({ params }: GameParams) {
  const config: GameParams = {
    params: params,
  };

  const singularFeature: string = formatSingularFeature(params.feature);

  let solution: GeoOutlineData | undefined = undefined;
  const possibleGuesses: string[] = [];

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );
      const correctCountry: Country | undefined = getSolution(
        OutlinerGame,
        config,
        countries
      );
      if (!correctCountry) return <>Error! Could not generate the solution</>;
      solution = getCountryOutlineData(correctCountry, false, false);
      possibleGuesses.push(...countries.map((c) => c.englishShortName));
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
        />
      )}
    </>
  );
}
