<script lang="ts">
	import { onMount } from 'svelte';
	import { render } from '$lib/engine/renderer';
	import { loadGeoData, type GeoData } from '$lib/geo/loader';
	import {
		globeState,
		updateRotation,
		updateZoom,
		toggleAutoRotate
	} from '$lib/stores/globe-state';

	let canvasRef: HTMLPreElement;
	let frameId: number;
	let geoData: GeoData | null = null;
	let loading = true;
	let output = '';
	let charWidth = 6;
	let charHeight = 10;

	// Load geographic data on mount
	onMount(async () => {
		try {
			geoData = await loadGeoData();
			loading = false;
		} catch (error) {
			console.error('Failed to load geographic data:', error);
		}

		measureCharDimensions();
		updateCanvasSize();
		window.addEventListener('resize', updateCanvasSize);

		// Start animation loop
		frameId = requestAnimationFrame(animate);

		return () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}
			window.removeEventListener('resize', updateCanvasSize);
		};
	});

	// measure actual rendered character dimensions from a hidden clone with identical styles
	function measureCharDimensions() {
		const el = document.createElement('pre');
		el.style.cssText =
			"font-family:'Courier New','Monaco','Menlo',monospace;font-size:10px;line-height:1;letter-spacing:0;position:absolute;top:-9999px;visibility:hidden;white-space:pre";
		const cols = 20;
		const rows = 10;
		el.textContent = Array(rows).fill('X'.repeat(cols)).join('\n');
		document.body.appendChild(el);
		const rect = el.getBoundingClientRect();
		document.body.removeChild(el);
		charWidth = rect.width / cols;
		charHeight = rect.height / rows;
	}

	// for the globe to appear circular the grid must satisfy:
	//   2 * width * charWidth = height * charHeight
	// derived from renderer aspectRatio=0.5 and equal physical pixel extent in x/y
	function updateCanvasSize() {
		if (!canvasRef) return;

		const targetRatio = charHeight / (2 * charWidth); // width / height
		const maxCols = Math.floor(window.innerWidth / charWidth);
		const maxRows = Math.floor(window.innerHeight / charHeight);

		let cols: number, rows: number;
		if (maxCols / maxRows > targetRatio) {
			rows = maxRows;
			cols = Math.round(rows * targetRatio);
		} else {
			cols = maxCols;
			rows = Math.round(cols / targetRatio);
		}

		globeState.update((state) => ({
			...state,
			width: Math.max(20, cols),
			height: Math.max(10, rows)
		}));
	}

	/**
	 * Animation loop
	 */
	let lastFrame = 0;
	const targetFPS = 30;
	const frameDuration = 1000 / targetFPS;

	function animate(timestamp: number) {
		// Throttle to target FPS
		if (timestamp - lastFrame < frameDuration) {
			frameId = requestAnimationFrame(animate);
			return;
		}

		lastFrame = timestamp;

		// Auto-rotation
		if ($globeState.autoRotate) {
			globeState.update((state) => ({
				...state,
				rotationY: state.rotationY + state.rotationSpeed
			}));
		}

		// Render frame
		if (!loading && geoData) {
			output = render($globeState, geoData);
		} else if (loading) {
			output = 'Loading geographic data...';
		}

		// Schedule next frame
		frameId = requestAnimationFrame(animate);
	}

	/**
	 * Mouse drag to rotate
	 */
	function handleMouseDown(e: MouseEvent) {
		globeState.update((state) => ({
			...state,
			isDragging: true,
			lastMouseX: e.clientX,
			lastMouseY: e.clientY
		}));
	}

	function handleMouseMove(e: MouseEvent) {
		if (!$globeState.isDragging) return;

		const deltaX = e.clientX - $globeState.lastMouseX;
		const deltaY = e.clientY - $globeState.lastMouseY;

		updateRotation(deltaX * 0.01, deltaY * 0.01);

		globeState.update((state) => ({
			...state,
			lastMouseX: e.clientX,
			lastMouseY: e.clientY
		}));
	}

	function handleMouseUp() {
		globeState.update((state) => ({
			...state,
			isDragging: false
		}));
	}

	/**
	 * Mouse wheel to zoom
	 */
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		updateZoom(e.deltaY * 0.01);
	}

	/**
	 * Keyboard controls
	 */
	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				updateRotation(0, -0.1);
				break;
			case 'ArrowDown':
				e.preventDefault();
				updateRotation(0, 0.1);
				break;
			case 'ArrowLeft':
				e.preventDefault();
				updateRotation(-0.1, 0);
				break;
			case 'ArrowRight':
				e.preventDefault();
				updateRotation(0.1, 0);
				break;
			case '+':
			case '=':
				e.preventDefault();
				updateZoom(-0.5);
				break;
			case '-':
			case '_':
				e.preventDefault();
				updateZoom(0.5);
				break;
			case ' ':
				e.preventDefault();
				toggleAutoRotate();
				break;
		}
	}
</script>

<svelte:window
	on:keydown={handleKeyDown}
	on:mouseup={handleMouseUp}
	on:mousemove={handleMouseMove}
/>

<div class="globe-container">
	<pre
		bind:this={canvasRef}
		class="globe-canvas"
		on:mousedown={handleMouseDown}
		on:wheel={handleWheel}
		role="img"
		aria-label="Interactive 3D ASCII Earth globe"
		tabindex="0">{output}</pre>

	<!--  -->
</div>

<style>
	.globe-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #000;
	}

	.globe-canvas {
		font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
		font-size: 10px;
		line-height: 1;
		letter-spacing: 0;
		margin: 0;
		padding: 0;
		background: #000;
		color: #fff;
		white-space: pre;
		overflow: hidden;
		user-select: none;
		cursor: grab;
		border: none;
		outline: none;
	}

	.globe-canvas:active {
		cursor: grabbing;
	}
</style>
