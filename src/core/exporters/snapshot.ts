import * as THREE from 'three';

/**
 * Captures high-res PNG snapshot from the Three.js renderer canvas.
 *
 * The renderer runs without `preserveDrawingBuffer` for performance, so the
 * canvas must be re-rendered synchronously here before reading pixels.
 * ThreeCanvas attaches the active scene/camera to the renderer instance
 * (`__forgeScene` / `__forgeCamera`) to make that possible.
 */
export function captureCanvasSnapshot(
  renderer: THREE.WebGLRenderer,
  filename: string = 'kinetic-forge-render.png'
) {
  const scene = (renderer as any).__forgeScene as THREE.Scene | undefined;
  const camera = (renderer as any).__forgeCamera as THREE.Camera | undefined;

  // Force a fresh render pass so the drawing buffer is guaranteed fresh
  if (scene && camera) {
    renderer.render(scene, camera);
  }

  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
