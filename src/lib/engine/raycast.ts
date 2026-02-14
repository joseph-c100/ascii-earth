import { Vector3 } from './math';

/**
 * Represents a ray in 3D space
 */
export interface Ray {
	origin: Vector3;
	direction: Vector3;
}

/**
 * Represents a ray-sphere intersection hit
 */
export interface Hit {
	distance: number;
	point: Vector3;
}

/**
 * Test ray-sphere intersection using quadratic equation
 *
 * Ray: P(t) = origin + t * direction
 * Sphere: |P - center|² = radius²
 *
 * Solving yields: at² + bt + c = 0
 * where:
 *   a = direction · direction (always 1 for normalized rays)
 *   b = 2 * direction · (origin - center)
 *   c = (origin - center) · (origin - center) - radius²
 */
export function raySphereIntersect(
	ray: Ray,
	radius: number,
	center: Vector3 = new Vector3(0, 0, 0)
): Hit | null {
	const oc = ray.origin.subtract(center);

	const a = ray.direction.dot(ray.direction);
	const b = 2 * oc.dot(ray.direction);
	const c = oc.dot(oc) - radius * radius;

	const discriminant = b * b - 4 * a * c;

	// No intersection
	if (discriminant < 0) {
		return null;
	}

	// Use closest intersection point (nearest to camera)
	const t = (-b - Math.sqrt(discriminant)) / (2 * a);

	// Intersection behind camera
	if (t < 0) {
		return null;
	}

	const point = ray.origin.add(ray.direction.scale(t));

	return {
		distance: t,
		point
	};
}

/**
 * Create a ray from screen coordinates
 *
 * @param ndcX Normalized device coordinate X (-1 to 1)
 * @param ndcY Normalized device coordinate Y (-1 to 1)
 * @param cameraDistance Distance of camera from origin
 * @param aspectRatio Width/height ratio (accounts for non-square characters)
 */
export function createRay(
	ndcX: number,
	ndcY: number,
	cameraDistance: number,
	aspectRatio: number = 0.5
): Ray {
	// Account for character aspect ratio (typically characters are taller than wide)
	const x = ndcX * aspectRatio;
	const y = ndcY;

	// Camera positioned along negative Z axis, looking at origin
	const origin = new Vector3(0, 0, -cameraDistance);

	// Direction from camera through pixel toward scene
	const direction = new Vector3(x, y, 1).normalize();

	return {
		origin,
		direction
	};
}
