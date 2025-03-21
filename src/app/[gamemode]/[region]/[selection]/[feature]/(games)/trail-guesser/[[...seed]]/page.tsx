import { getCapitals, getCountries } from '@/api';
import {
  generateStaticFeatureParams,
  generateStaticSeedParams,
  getSolution,
} from '@/utils';
import { City, Country } from '@prisma/client';
import {
  GameParams,
  formatRegion,
  formatSingularFeature,
} from '@/types/routing/dynamicParams';
import TrailGuesser, {
  TrailFeature,
} from '@/components/games/trailGuesser/TrailGuesser';
import { SeedInfo, TrailGuesserGame } from '@/types/games';
import { getSeed } from '@/backendUtils';

export async function generateStaticParams(gp: GameParams) {
  return generateStaticSeedParams(() => getTrailGuesserPossibilities(gp));
}

async function getTrailGuesserPossibilities({
  params,
}: GameParams): Promise<(Country | City)[]> {
  switch (params.feature) {
    case 'countries':
      return await getCountries(params.selection, params.region);
    case 'capitals':
      return await getCapitals(params.selection, params.region);
    default:
      throw new Error('Invalid feature');
  }
}

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

export default async function TrailGuesserPage({ params }: GameParams) {
  const seed: number = getSeed({ params }, (newSeed: number | undefined) =>
    TrailGuesserGame.getSeededHref({ params: params }, newSeed)
  );

  let dropdownFeatures: TrailFeature[] = [];
  let correctFeature: TrailFeature | undefined = undefined;
  const config: GameParams = {
    params: params,
  };

  const possibilities: (Country | City)[] = await getTrailGuesserPossibilities({
    params,
  });

  switch (params.feature) {
    case 'countries':
      const countries: Country[] = possibilities as Country[];
      const dropdownCountries: Country[] = await getCountries(
        params.selection,
        'World'
      );
      dropdownFeatures = dropdownCountries.map((c) => countryToTrailEntity(c));
      const correctCountry: Country | undefined = getSolution(countries, seed);
      if (!correctCountry)
        return <>Error! Could not generate the correct country</>;
      correctFeature = countryToTrailEntity(correctCountry);
      break;
    case 'capitals':
      const capitals: City[] = possibilities as City[];
      const dropdownCapitals: City[] = await getCapitals(
        params.selection,
        'World'
      );
      dropdownFeatures = dropdownCapitals.map((c) => cityToTrailEntity(c));
      const correctCapital: City | undefined = getSolution(capitals, seed);
      if (!correctCapital)
        return <>Error! Could not generate the correct capital</>;
      correctFeature = cityToTrailEntity(correctCapital);
      break;
  }

  if (!correctFeature)
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

  const seedInfo: SeedInfo = {
    seed: seed,
    seedCount: possibilities.length,
  };

  return (
    <>
      <TrailGuesser
        title={`Guess the ${formatSingularFeature(params.feature)} in ${formatRegion(params.region)}`}
        feature={params.feature}
        allowedGuesses={getAllowedGuesses()}
        dropdownFeatures={dropdownFeatures}
        correctFeature={correctFeature}
        gameConfig={config}
        seedInfo={seedInfo}
      />
    </>
  );
}
