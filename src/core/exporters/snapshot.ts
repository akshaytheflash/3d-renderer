import * as THREE from 'three';

/**
 * Captures high-res transparent PNG snapshot from Three.js renderer canvas
 */
export function captureCanvasSnapshot(
  renderer: THREE.WebGLRenderer,
  filename: string = 'kinetic-forge-render.png'
) {
  // Force a render pass to ensure canvas is fresh
  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
