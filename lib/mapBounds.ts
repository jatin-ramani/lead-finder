export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
}

export interface GeographicBounds {
  south: number;
  north: number;
  west: number;
  east: number;
  crossesAntimeridian: boolean;
}

export type ClusterBbox = [number, number, number, number];

/** Keep longitudes in the canonical range used by GeoJSON and Supercluster. */
export function normalizeLongitude(longitude: number): number {
  const normalized = ((longitude + 180) % 360 + 360) % 360 - 180;
  return normalized === 180 ? -180 : normalized;
}

/**
 * Returns the equivalent longitude nearest a visible map center. The location
 * is unchanged; this only chooses the closest wrapped world copy for Leaflet.
 */
export function longitudeNear(longitude: number, referenceLongitude: number): number {
  let displayed = normalizeLongitude(longitude);
  const reference = Number.isFinite(referenceLongitude)
    ? referenceLongitude
    : displayed;

  while (displayed - reference > 180) displayed -= 360;
  while (reference - displayed > 180) displayed += 360;
  return displayed;
}

/**
 * Finds the shortest longitudinal interval containing all coordinates. This
 * prevents points on either side of the antimeridian from fitting the whole
 * world instead of their compact real-world area.
 */
export function geographicBoundsForCoordinates(
  coordinates: readonly GeographicCoordinate[],
): GeographicBounds | null {
  const validCoordinates = coordinates.filter(
    ({ latitude, longitude }) => Number.isFinite(latitude)
      && Number.isFinite(longitude)
      && latitude >= -90
      && latitude <= 90
      && longitude >= -180
      && longitude <= 180,
  );
  if (validCoordinates.length === 0) return null;

  const latitudes = validCoordinates.map(({ latitude }) => latitude);
  const longitudes = validCoordinates
    .map(({ longitude }) => normalizeLongitude(longitude))
    .sort((left, right) => left - right);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);

  if (longitudes.length === 1) {
    return {
      south,
      north,
      west: longitudes[0],
      east: longitudes[0],
      crossesAntimeridian: false,
    };
  }

  let largestGap = -1;
  let largestGapIndex = 0;
  for (let index = 0; index < longitudes.length; index += 1) {
    const current = longitudes[index];
    const next = index === longitudes.length - 1
      ? longitudes[0] + 360
      : longitudes[index + 1];
    const gap = next - current;
    if (gap > largestGap) {
      largestGap = gap;
      largestGapIndex = index;
    }
  }

  const west = longitudes[(largestGapIndex + 1) % longitudes.length];
  let east = longitudes[largestGapIndex];
  if (east < west) east += 360;

  return {
    south,
    north,
    west,
    east,
    crossesAntimeridian: east > 180 || west < -180,
  };
}

/** Split a wrapped Leaflet viewport into the canonical bboxes Supercluster expects. */
export function clusterBboxesForViewport(
  west: number,
  south: number,
  east: number,
  north: number,
): ClusterBbox[] {
  if (east - west >= 359.999) return [[-180, south, 180, north]];

  const canonicalWest = normalizeLongitude(west);
  const canonicalEast = normalizeLongitude(east);
  if (canonicalWest > canonicalEast) {
    return [
      [canonicalWest, south, 180, north],
      [-180, south, canonicalEast, north],
    ];
  }

  return [[canonicalWest, south, canonicalEast, north]];
}
