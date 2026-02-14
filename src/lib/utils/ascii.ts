/**
 * ASCII character sets for different terrain types
 */
const WATER_CHARS = ' .·-:=+*#%@';
const LAND_CHARS = ' .,;:clodxkO0KXNWM';

/**
 * Select an ASCII character based on lighting and terrain type
 *
 * @param lighting Lighting value (0-1, where 0 is dark and 1 is bright)
 * @param isLand Whether the surface is land (true) or water (false)
 * @returns ASCII character to render
 */
export function selectCharacter(lighting: number, isLand: boolean): string {
	const chars = isLand ? LAND_CHARS : WATER_CHARS;

	// Clamp lighting to 0-1 range
	const clampedLighting = Math.max(0, Math.min(1, lighting));

	// Map lighting to character index
	const index = Math.floor(clampedLighting * (chars.length - 1));

	return chars[index];
}
