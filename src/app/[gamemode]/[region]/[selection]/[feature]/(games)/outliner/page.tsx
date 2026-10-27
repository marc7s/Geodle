import { getCountries } from '@/api';
import { getUnsupportedReason } from '@/utils';
import { Country } from '@prisma/client';
import {
  GamePageProps,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import { OutlinerGame } from '@/types/games';
import { GeoOutlineData } from '@/geoUtils';
import Outliner from '@/components/games/outliner/Outliner';
import { getCountryOutlineData } from '@/geoBuildUtils';

export default async function OutlinerPage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    OutlinerGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  const singularFeature: string = formatSingularFeature(params.feature);

  // The solution is picked by the client, based on the seed
  // The outlines are only references to static files, so they are cheap to include for every country
  let possibleSolutions: GeoOutlineData[] = [];

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );
      possibleSolutions = countries.map((c) =>
        getCountryOutlineData(c, false, false)
      );
      break;
    case 'capitals':
      return <>Outliner does not support capitals</>;
  }

  if (possibleSolutions.length < 1)
    return <>Error! Could not generate the solution</>;

  return (
    <>
      <Outliner
        title={`Guess the ${singularFeature} based on its outline`}
        feature={params.feature}
        allowedGuesses={3}
        possibleSolutions={possibleSolutions}
        gameConfig={{ params: params }}
      />
    </>
  );
}
