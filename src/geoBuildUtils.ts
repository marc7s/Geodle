import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { BoundingBox, viewport } from '@mapbox/geo-viewport';
import { Country, City } from '@prisma/client';
import { GameRegion, gameRegions } from './types/routing/generated/regions';
import { GeoJsonData, GeoOutlineData } from './geoUtils';

const geoDataBasePath: string = join(process.cwd(), 'src/data/generated/geo');

const countryOutlinePaths: string[] = readdirSync(
  join(geoDataBasePath, 'countries')
).filter((p) => p.match(/[A-Z]{2}(\.min\.json|\.json)/));

const regionOutlinePaths: string[] = readdirSync(
  join(geoDataBasePath, 'regions')
).filter((p) => p.match(/\w+(\.min\.json|\.json)/));

// Creates a custom GeoJsonData object for displaying a circle at a given lat/long
function createPointOutline(lat: number, long: number): GeoJsonData {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [long, lat] },
      },
    ],
  };
}

// Return the center and zoom level that will fit the GeoJsonData
// Based on https://github.com/mariusandra/pigeon-maps/issues/23#issuecomment-419710490
function getCenterAndZoomFromGeoJsonData(
  data: GeoJsonData
): [[number, number], number] {
  if (!('bbox' in data) || !Array.isArray(data['bbox'])) return [[0, 0], 13];
  const bbox: BoundingBox = data['bbox'] as BoundingBox;
  const { center, zoom } = viewport(bbox, [800, 800]);

  return [center.reverse() as [number, number], Math.min(zoom, 13)];
}

export function getCountryOutlineData(
  country: Country,
  minimized: boolean,
  errorOnMissing: boolean = false
): GeoOutlineData {
  const ext: string = minimized ? '.min.json' : '.json';
  const countryOutlinePath = countryOutlinePaths.find(
    (p) => p === `${country.iso2Code.toUpperCase()}${ext}`
  );

  if (!countryOutlinePath && errorOnMissing)
    throw new Error(
      `Could not find country outline for ${country.englishShortName}`
    );

  // Return the parsed data if it exists, otherwise create a point for the country
  const countryOutline: GeoJsonData = countryOutlinePath
    ? JSON.parse(
        readFileSync(
          join(geoDataBasePath, 'countries', countryOutlinePath)
        ).toString()
      )
    : createPointOutline(country.lat, country.long);

  const [center, zoom] = getCenterAndZoomFromGeoJsonData(countryOutline);

  return {
    name: country.englishShortName,
    answers: [country.englishShortName],
    outline: countryOutline,
    center: center,
    zoomLevelToFit: zoom,
  };
}

export function getCityOutlineData(city: City): GeoOutlineData {
  return {
    name: city.englishName,
    answers: [city.englishName],
    outline: createPointOutline(city.lat, city.long),
    center: [city.lat, city.long],
    zoomLevelToFit: 10,
  };
}

// Gets the GeoJsonData for the outline of a Region
export function getRegionOutlineData(region: GameRegion): GeoJsonData[] {
  return (region === 'World' ? gameRegions : [region])
    .filter((r) => r !== 'World') // 'World' is not a region
    .map((r) => {
      const regionOutlinePath = regionOutlinePaths.find(
        (p) => p === `${r}.min.json`
      );
      if (!regionOutlinePath)
        throw new Error(`Could not find region outline for ${r}`);
      return JSON.parse(
        readFileSync(
          join(geoDataBasePath, 'regions', regionOutlinePath)
        ).toString()
      );
    });
}
