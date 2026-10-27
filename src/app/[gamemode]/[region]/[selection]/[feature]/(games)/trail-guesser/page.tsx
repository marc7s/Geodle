import { getCapitals, getCountries } from '@/api';
import { getUnsupportedReason } from '@/utils';
import { City, Country } from '@prisma/client';
import {
  GamePageProps,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import TrailGuesser, {
  TrailFeature,
} from '@/components/games/trailGuesser/TrailGuesser';
import { TrailGuesserGame } from '@/types/games';

function countryToTrailEntity(country: Country): TrailFeature {
  return {
    point: { lat: country.lat, long: country.long },
    displayValue: country.englishShortName,
    selectValue: country.englishShortName.toLocaleLowerCase(),
  };
}

function cityToTrailEntity(city: City): TrailFeature {
  return {
    point: { lat: city.lat, long: city.long },
    displayValue: city.englishName,
    selectValue: city.englishName.toLocaleLowerCase(),
  };
}

// Returns the index of each possibility in the dropdown list
// The possibilities in a region are always part of the (World) dropdown list, so they are sent as indices
function getIndices<T extends { id: number }>(
  possibilities: T[],
  dropdownItems: T[]
): number[] {
  const indexById: Map<number, number> = new Map(
    dropdownItems.map((item, i) => [item.id, i])
  );
  return possibilities.map((p) => {
    const index: number | undefined = indexById.get(p.id);
    if (index === undefined)
      throw new Error(`Possibility ${p.id} is not part of the dropdown`);
    return index;
  });
}

export default async function TrailGuesserPage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    TrailGuesserGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  let dropdownFeatures: TrailFeature[] = [];
  let possibleIndices: number[] = [];

  // The solution is picked by the client, based on the seed
  switch (params.feature) {
    case 'countries':
      const countries: Country[] = await getCountries(
        params.selection,
        params.region
      );
      const dropdownCountries: Country[] = await getCountries(
        params.selection,
        'World'
      );
      dropdownFeatures = dropdownCountries.map((c) => countryToTrailEntity(c));
      possibleIndices = getIndices(countries, dropdownCountries);
      break;
    case 'capitals':
      const capitals: City[] = await getCapitals(
        params.selection,
        params.region
      );
      const dropdownCapitals: City[] = await getCapitals(
        params.selection,
        'World'
      );
      dropdownFeatures = dropdownCapitals.map((c) => cityToTrailEntity(c));
      possibleIndices = getIndices(capitals, dropdownCapitals);
      break;
  }

  if (possibleIndices.length < 1)
    return <>Error! Could not generate the correct feature</>;

  function getAllowedGuesses(): number {
    switch (params.region) {
      case 'World':
        return 10;
      case 'Africa':
        return 8;
      case 'Americas':
        return 6;
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
      <TrailGuesser
        title={`Guess the ${formatSingularFeature(params.feature)} in ${formatRegion(params.region)}`}
        feature={params.feature}
        allowedGuesses={getAllowedGuesses()}
        dropdownFeatures={dropdownFeatures}
        possibleIndices={possibleIndices}
        gameConfig={{ params: params }}
      />
    </>
  );
}
