export interface GeoPoint {
  lat: number;
  long: number;
}

export interface GeoVector2 {
  origin: GeoPoint;
  distance: number;
  bearingDeg: number;
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

// Returns the distance in meters between two GeoPoints, using the haversine formula
function haversine(startPoint: GeoPoint, endPoint: GeoPoint): number {
  // Radius of the earth in meters
  const R = 6371e3;

  // Convert points to rad
  const startRad: GeoPoint = geoPointToRad(startPoint);
  const endRad: GeoPoint = geoPointToRad(endPoint);

  // Calculate difference in lat/long between the points, in radians
  const dLatRad: number = endRad.lat - startRad.lat;
  const dLongRad: number = endRad.long - startRad.long;

  const a =
    Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
    Math.cos(startRad.lat) *
      Math.cos(endRad.lat) *
      Math.sin(dLongRad / 2) *
      Math.sin(dLongRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function getVectorBetweenCoordinates(
  startPoint: GeoPoint,
  endPoint: GeoPoint
): GeoVector2 {
  // Convert points to rad
  const startRad: GeoPoint = geoPointToRad(startPoint);
  const endRad: GeoPoint = geoPointToRad(endPoint);

  const dLong: number = endRad.long - startRad.long;

  const y = Math.sin(dLong) * Math.cos(endRad.lat);
  const x =
    Math.cos(startRad.lat) * Math.sin(endRad.lat) -
    Math.sin(startRad.lat) * Math.cos(endRad.lat) * Math.cos(dLong);

  // Calculate the initial bearing (azimuth)
  const initialBearing: number = radToDeg(Math.atan2(y, x));

  return {
    origin: startPoint,
    bearingDeg: initialBearing,
    distance: haversine(startPoint, endPoint),
  };
}
