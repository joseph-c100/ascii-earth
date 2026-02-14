/**
 * GeoJSON data structure types
 */
export interface GeoData {
	type: 'FeatureCollection';
	features: Array<{
		type: 'Feature';
		geometry: {
			type: 'Polygon' | 'MultiPolygon';
			coordinates: number[][][] | number[][][][];
		};
		properties?: Record<string, unknown>;
	}>;
}

let geoDataCache: GeoData | null = null;

/**
 * Load geographic data from GeoJSON file
 * Caches the result for subsequent calls
 */
export async function loadGeoData(): Promise<GeoData> {
	if (geoDataCache) {
		return geoDataCache;
	}

	try {
		const response = await fetch('/data/earth-110m.geojson');
		if (!response.ok) {
			throw new Error(`Failed to load geo data: ${response.statusText}`);
		}

		geoDataCache = await response.json();
		return geoDataCache as GeoData;
	} catch (error) {
		console.error('Error loading geographic data:', error);
		throw error;
	}
}
