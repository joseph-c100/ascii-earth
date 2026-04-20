import { writable } from 'svelte/store';

/**
 * Globe state interface
 */
export interface GlobeState {
	// Camera
	cameraDistance: number; // Zoom level (1.2-10)
	rotationX: number; // Latitude rotation (-π/2 to π/2)
	rotationY: number; // Longitude rotation (0 to 2π)

	// Rendering
	width: number; // Terminal width in characters
	height: number; // Terminal height in characters
	sphereRadius: number; // Base sphere radius

	// Interaction
	isDragging: boolean;
	lastMouseX: number;
	lastMouseY: number;

	// Animation
	autoRotate: boolean;
	rotationSpeed: number;
}

/**
 * Initial globe state
 */
const initialState: GlobeState = {
	cameraDistance: 5,
	rotationX: 0,
	rotationY: 0,
	width: 80,
	height: 40,
	sphereRadius: 1,
	isDragging: false,
	lastMouseX: 0,
	lastMouseY: 0,
	autoRotate: true,
	rotationSpeed: 0.01
};

/**
 * Global globe state store
 */
export const globeState = writable<GlobeState>(initialState);

/**
 * Helper function to update rotation
 */
export function updateRotation(deltaX: number, deltaY: number) {
	globeState.update((state) => ({
		...state,
		rotationY: state.rotationY + deltaX,
		rotationX: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.rotationX + deltaY))
	}));
}

/**
 * Helper function to update zoom
 */
export function updateZoom(delta: number) {
	globeState.update((state) => ({
		...state,
		cameraDistance: Math.max(1.2, Math.min(10, state.cameraDistance + delta))
	}));
}

/**
 * Helper function to toggle auto-rotate
 */
export function toggleAutoRotate() {
	globeState.update((state) => ({
		...state,
		autoRotate: !state.autoRotate
	}));
}
