import { Point } from 'pigeon-maps';

export interface GeoPoint {
  lat: number;
  long: number;
}

export interface GeoVector2 {
  origin: GeoPoint;
  distance: number;
  bearingDeg: number;
}

export type GeoJsonData = object;

// Where to get GeoJSON data from: either embedded directly (for small data such as points),
// or a URL to a static file that the client loads when needed (see `useGeoJson`).
// Large outlines are served as files, so they are not embedded in every page that uses them
export type GeoJsonSource = { data: GeoJsonData } | { url: string };

export interface GeoOutlineData {
  name: string;
  answers: string[];
  outline: GeoJsonSource;
  center: Point;
  zoomLevelToFit: number;
  guessed?: boolean;
}

function radToDeg(rad: number): number {
  return ((rad * 180) / Math.PI + 360) % 360;
}

function geoPointToRad(geoPoint: GeoPoint): GeoPoint {
  return {
    lat: (geoPoint.lat * Math.PI) / 180,
    long: (geoPoint.long * Math.PI) / 180,
  };
}

// Returns the rhumb line between two points: the route that keeps a constant compass direction
// It goes east or west the shorter way around the globe, and never passes over the north or south pole,
// so a country to the south is always shown as south, even if the shortest path would cross a pole
// The distance is the distance travelled along that route, so it matches the direction shown
function getRhumbLine(
  startPoint: GeoPoint,
  endPoint: GeoPoint
): { bearingDeg: number; distance: number } {
  // Radius of the earth in meters
  const R = 6371e3;

  // Avoid infinite values at the poles
  const maxLat: number = 89.9999;
  const clampLat = (lat: number) => Math.max(-maxLat, Math.min(maxLat, lat));
  const startRad: GeoPoint = geoPointToRad({
    lat: clampLat(startPoint.lat),
    long: startPoint.long,
  });
  const endRad: GeoPoint = geoPointToRad({
    lat: clampLat(endPoint.lat),
    long: endPoint.long,
  });

  const dLat: number = endRad.lat - startRad.lat;
  // The difference in latitude on a Mercator projection
  const dPsi: number = Math.log(
    Math.tan(Math.PI / 4 + endRad.lat / 2) /
      Math.tan(Math.PI / 4 + startRad.lat / 2)
  );

  // Go the shorter way east or west, across the date line if needed
  let dLong: number = endRad.long - startRad.long;
  if (dLong > Math.PI) dLong -= 2 * Math.PI;
  if (dLong < -Math.PI) dLong += 2 * Math.PI;

  // How much an east-west distance is stretched at these latitudes
  // For (almost) east-west routes dPsi is close to 0, so use the latitude directly instead
  const q: number =
    Math.abs(dPsi) > 1e-12 ? dLat / dPsi : Math.cos(startRad.lat);

  return {
    bearingDeg: radToDeg(Math.atan2(dLong, dPsi)),
    distance: Math.sqrt(dLat * dLat + q * q * dLong * dLong) * R,
  };
}

export function getVectorBetweenCoordinates(
  startPoint: GeoPoint,
  endPoint: GeoPoint
): GeoVector2 {
  const { bearingDeg, distance } = getRhumbLine(startPoint, endPoint);
  return {
    origin: startPoint,
    bearingDeg: bearingDeg,
    distance: distance,
  };
}
