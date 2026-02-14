import { Vector3, rotateX, rotateY, cartesianToLatLon } from './math';
import { createRay, raySphereIntersect } from './raycast';
import { calculateLighting } from './lighting';
import { selectCharacter } from '$lib/utils/ascii';
import { isLand } from '$lib/geo/lookup';
import type { GlobeState } from '$lib/stores/globe-state';
import type { GeoData } from '$lib/geo/loader';

/**
 * Create an empty character buffer
 */
function createBuffer(width: number, height: number): string[][] {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(' '));
}

/**
 * Create a z-buffer (depth buffer) initialized to infinity
 */
function createZBuffer(width: number, height: number): number[][] {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(Infinity));
}

/**
 * Convert character buffer to string
 */
function bufferToString(buffer: string[][]): string {
	return buffer.map((row) => row.join('')).join('\n');
}

/**
 * Main rendering function
 * Renders the ASCII globe for the current frame
 *
 * @param state Globe state (camera, rotation, size)
 * @param geoData Geographic data for land/water lookup
 * @returns ASCII string ready to display
 */
export function render(state: GlobeState, geoData: GeoData | null): string {
	const buffer = createBuffer(state.width, state.height);
	const zBuffer = createZBuffer(state.width, state.height);

	// Character aspect ratio (characters are typically taller than wide)
	const aspectRatio = 0.5;

	// For each character position
	for (let y = 0; y < state.height; y++) {
		for (let x = 0; x < state.width; x++) {
			// 1. Convert screen coords to normalized device coords (-1 to 1)
			const ndcX = (x / state.width) * 2 - 1;
			const ndcY = 1 - (y / state.height) * 2;

			// 2. Create ray from camera through pixel
			const ray = createRay(ndcX, ndcY, state.cameraDistance, aspectRatio);

			// 3. Test ray-sphere intersection
			const hit = raySphereIntersect(ray, state.sphereRadius);

			if (hit) {
				// 4. Get 3D point on sphere
				let point = hit.point;

				// 5. Apply rotation to point (inverse rotation to rotate world instead of camera)
				point = rotateY(point, -state.rotationY);
				point = rotateX(point, -state.rotationX);

				// 6. Convert to lat/lon
				const { lat, lon } = cartesianToLatLon(point);

				// 7. Lookup terrain type
				const terrain = geoData ? isLand(lat, lon, geoData) : false;

				// 8. Calculate lighting
				const normal = point.normalize();
				const lighting = calculateLighting(normal);

				// 9. Select ASCII character
				const char = selectCharacter(lighting, terrain);

				// 10. Z-buffer test and write
				if (hit.distance < zBuffer[y][x]) {
					buffer[y][x] = char;
					zBuffer[y][x] = hit.distance;
				}
			}
		}
	}

	return bufferToString(buffer);
}
