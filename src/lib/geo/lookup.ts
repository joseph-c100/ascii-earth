import type { GeoData } from './loader';

/**
 * Point-in-polygon test using ray casting algorithm
 *
 * Casts a horizontal ray from the point and counts edge crossings.
 * Odd count = inside polygon, even count = outside
 *
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param polygon Array of [lon, lat] coordinates
 */
export function isPointInPolygon(lat: number, lon: number, polygon: number[][]): boolean {
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0];
		const yi = polygon[i][1];
		const xj = polygon[j][0];
		const yj = polygon[j][1];

		const intersect =
			yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

		if (intersect) inside = !inside;
	}

	return inside;
}

/**
 * Determine if a lat/lon coordinate is on land
 *
 * @param lat Latitude in radians
 * @param lon Longitude in radians
 * @param geoData Geographic data (GeoJSON)
 * @returns true if land, false if water
 */
export function isLand(lat: number, lon: number, geoData: GeoData): boolean {
	// Convert from radians to degrees
	const latDeg = (lat * 180) / Math.PI;
	const lonDeg = (lon * 180) / Math.PI;

	// Test against all land polygons
	for (const feature of geoData.features) {
		if (feature.geometry.type === 'Polygon') {
			// Single polygon
			for (const ring of feature.geometry.coordinates as number[][][]) {
				if (isPointInPolygon(latDeg, lonDeg, ring)) {
					return true;
				}
			}
		} else if (feature.geometry.type === 'MultiPolygon') {
			// Multiple polygons
			for (const polygon of feature.geometry.coordinates as number[][][][]) {
				for (const ring of polygon) {
					if (isPointInPolygon(latDeg, lonDeg, ring)) {
						return true;
					}
				}
			}
		}
	}

	return false; // Water
}
