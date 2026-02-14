/**
 * 3D Vector class for mathematical operations
 */
export class Vector3 {
	constructor(
		public x: number,
		public y: number,
		public z: number
	) {}

	/**
	 * Add two vectors
	 */
	add(v: Vector3): Vector3 {
		return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
	}

	/**
	 * Subtract two vectors
	 */
	subtract(v: Vector3): Vector3 {
		return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
	}

	/**
	 * Scale vector by scalar
	 */
	scale(s: number): Vector3 {
		return new Vector3(this.x * s, this.y * s, this.z * s);
	}

	/**
	 * Dot product
	 */
	dot(v: Vector3): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	/**
	 * Cross product
	 */
	cross(v: Vector3): Vector3 {
		return new Vector3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}

	/**
	 * Vector length (magnitude)
	 */
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	/**
	 * Normalize vector (make length 1)
	 */
	normalize(): Vector3 {
		const len = this.length();
		if (len === 0) return new Vector3(0, 0, 0);
		return this.scale(1 / len);
	}
}

/**
 * Rotate a point around the X axis
 */
export function rotateX(point: Vector3, angle: number): Vector3 {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return new Vector3(
		point.x,
		point.y * cos - point.z * sin,
		point.y * sin + point.z * cos
	);
}

/**
 * Rotate a point around the Y axis
 */
export function rotateY(point: Vector3, angle: number): Vector3 {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return new Vector3(
		point.x * cos + point.z * sin,
		point.y,
		-point.x * sin + point.z * cos
	);
}

/**
 * Rotate a point around the Z axis
 */
export function rotateZ(point: Vector3, angle: number): Vector3 {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return new Vector3(
		point.x * cos - point.y * sin,
		point.x * sin + point.y * cos,
		point.z
	);
}

/**
 * Convert 3D Cartesian coordinates to latitude/longitude
 */
export function cartesianToLatLon(point: Vector3): { lat: number; lon: number } {
	const radius = point.length();

	return {
		lat: Math.asin(point.z / radius),
		lon: Math.atan2(point.y, point.x)
	};
}

/**
 * Convert latitude/longitude to 3D Cartesian coordinates
 */
export function latLonToCartesian(lat: number, lon: number, radius: number = 1): Vector3 {
	return new Vector3(
		radius * Math.cos(lat) * Math.cos(lon),
		radius * Math.cos(lat) * Math.sin(lon),
		radius * Math.sin(lat)
	);
}
