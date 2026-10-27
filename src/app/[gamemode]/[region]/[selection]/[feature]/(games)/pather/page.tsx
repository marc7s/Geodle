import { getCountries, getCountryPaths } from '@/api';
import { MapConfig, MapDefaultConfigs, getUnsupportedReason } from '@/utils';
import { Country } from '@prisma/client';
import { GamePageProps } from '@/types/routing/dynamicParams';
import { PatherGame } from '@/types/games';
import { GeoJsonSource } from '@/geoUtils';
import { getCountryOutlineData, getRegionOutlineData } from '@/geoBuildUtils';
import Pather, {
  PatherPath,
  PatherPiece,
} from '@/components/games/pather/Pather';
import { CountryPath } from '@/db';
import {
  OPT_PATHER_SKIP_EVERY_N_PATH,
  OPT_PATHER_USE_BIDIRECTIONAL_PATHS,
} from '@/optimizations';

function toPatherPath(path: CountryPath): PatherPath {
  return {
    country1: path.country1.iso3Code,
    country2: path.country2.iso3Code,
    paths: path.paths.map((p) => p.map((c) => c.iso3Code)),
  };
}

// The possible solutions, of which the seed picks one
// Note: changing the filtering or order here changes which solution each seed maps to
async function getPatherPaths(
  params: Awaited<GamePageProps['params']>
): Promise<PatherPath[]> {
  // Get all paths
  const paths: PatherPath[] = (
    await getCountryPaths(params.selection, params.region)
  )
    .filter(
      (_, i) =>
        OPT_PATHER_SKIP_EVERY_N_PATH !== 0 &&
        i % OPT_PATHER_SKIP_EVERY_N_PATH === 0
    )
    .map(toPatherPath);

  // Since the paths are bidirectional, we can double the number of possible paths by reversing each path
  if (OPT_PATHER_USE_BIDIRECTIONAL_PATHS)
    paths.push(
      ...paths.map((p) => {
        return {
          country1: p.country2,
          country2: p.country1,
          paths: p.paths.map((p) => [...p].reverse()), // Copy, since reverse() mutates the shared paths
        };
      })
    );

  return paths;
}

export default async function PatherPage(props: GamePageProps) {
  const params = await props.params;
  const unsupportedReason: string | undefined = getUnsupportedReason(
    PatherGame,
    { params }
  );
  if (unsupportedReason) return <>{unsupportedReason}</>;

  if (params.selection !== 'independent')
    return <>Pather only supports the independent selection</>;

  switch (params.feature) {
    case 'countries':
      break;
    case 'capitals':
      return <>Outliner does not support capitals</>;
  }

  const mapConfig: MapConfig = {
    ...MapDefaultConfigs.GetConfig(params.region),
    maxZoom: 10,
  };
  const backgroundData: GeoJsonSource[] = getRegionOutlineData(params.region);

  // The client picks the path, based on the seed
  const paths: PatherPath[] = await getPatherPaths(params);
  if (paths.length < 1) return <>No solution found</>;

  // Every country in the region, with only the fields the game needs
  const countries: Country[] = await getCountries(
    params.selection,
    params.region
  );
  const pieces: PatherPiece[] = countries.map((c) => {
    return {
      country: {
        id: c.id,
        iso3Code: c.iso3Code,
        englishShortName: c.englishShortName,
        bordersISO3: c.bordersISO3,
      },
      outline: getCountryOutlineData(c, true),
    };
  });

  return (
    <>
      <Pather
        feature={params.feature}
        possiblePaths={paths}
        pieces={pieces}
        backgroundData={backgroundData}
        gameConfig={{ params }}
        mapConfig={mapConfig}
      />
    </>
  );
}
