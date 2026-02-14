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

	// Load geographic data on mount
	onMount(async () => {
		try {
			geoData = await loadGeoData();
			loading = false;
		} catch (error) {
			console.error('Failed to load geographic data:', error);
		}

		// Update canvas size based on window
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

	/**
	 * Update canvas dimensions based on window size
	 */
	function updateCanvasSize() {
		if (!canvasRef) return;

		const width = Math.floor(window.innerWidth / 10);
		const height = Math.floor(window.innerHeight / 16);

		globeState.update((state) => ({
			...state,
			width: Math.max(40, Math.min(120, width)),
			height: Math.max(20, Math.min(60, height))
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

	.controls {
		margin-top: 20px;
		color: #0a0;
		font-family: monospace;
		font-size: 12px;
		text-align: center;
		opacity: 0.7;
	}

	.controls p {
		margin: 5px 0;
	}
</style>
