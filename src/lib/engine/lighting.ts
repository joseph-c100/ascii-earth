import { Vector3 } from './math';

/**
 * Calculate Lambertian (diffuse) lighting
 *
 * @param normal Surface normal vector (should be normalized)
 * @param lightDir Direction to light source (should be normalized)
 * @param ambient Ambient light level (0-1)
 * @returns Lighting value (0-1)
 */
export function calculateLighting(
	normal: Vector3,
	lightDir: Vector3 = new Vector3(0.5, 0.5, 1).normalize(),
	ambient: number = 0.2
): number {
	// Lambertian diffuse shading
	const diffuse = Math.max(0, normal.dot(lightDir));

	// Combine ambient and diffuse
	const lighting = Math.min(1, ambient + diffuse * 0.8);

	return lighting;
}
