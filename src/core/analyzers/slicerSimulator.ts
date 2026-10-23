import * as THREE from 'three';

export interface SlicedLayerLines {
  positions: Float32Array;
  layerCount: number;
  layerHeightMm: number;
}

/**
 * Procedural Cross-Section Slicer
 * Generates G-code style layer contours by intersecting horizontal slicing planes
 * with the 3D triangle mesh.
 */
export function generateLayerSlices(
  geometry: THREE.BufferGeometry,
  layerHeightMm: number = 0.4,
  maxLayersToGenerate: number = 200
): THREE.BufferGeometry {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (!bb) return new THREE.BufferGeometry();

  const minY = bb.min.y;
  const maxY = bb.max.y;
  const height = maxY - minY;
  if (height <= 0) return new THREE.BufferGeometry();

  const totalLayers = Math.min(Math.ceil(height / layerHeightMm), maxLayersToGenerate);
  const pos = geometry.attributes.position;
  const index = geometry.getIndex();
  const numFaces = index ? index.count / 3 : pos.count / 3;

  const linePositions: number[] = [];

  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  // For each layer height
  for (let l = 0; l < totalLayers; l++) {
    const planeY = minY + l * layerHeightMm + layerHeightMm * 0.5;

    // Intersect plane with all triangles in mesh
    for (let f = 0; f < numFaces; f++) {
      let i1 = f * 3;
      let i2 = f * 3 + 1;
      let i3 = f * 3 + 2;

      if (index) {
        i1 = index.getX(i1);
        i2 = index.getX(i2);
        i3 = index.getX(i3);
      }

      v1.fromBufferAttribute(pos, i1);
      v2.fromBufferAttribute(pos, i2);
      v3.fromBufferAttribute(pos, i3);

      // Fast AABB check: does triangle straddle planeY?
      const yMinTri = Math.min(v1.y, v2.y, v3.y);
      const yMaxTri = Math.max(v1.y, v2.y, v3.y);
      if (planeY < yMinTri || planeY > yMaxTri) continue;

      // Intersect edges with plane Y = planeY
      const intersectPoints: THREE.Vector3[] = [];

      const checkEdge = (pA: THREE.Vector3, pB: THREE.Vector3) => {
        if ((pA.y <= planeY && pB.y >= planeY) || (pA.y >= planeY && pB.y <= planeY)) {
          if (Math.abs(pB.y - pA.y) > 1e-6) {
            const t = (planeY - pA.y) / (pB.y - pA.y);
            intersectPoints.push(new THREE.Vector3().lerpVectors(pA, pB, t));
          }
        }
      };

      checkEdge(v1, v2);
      checkEdge(v2, v3);
      checkEdge(v3, v1);

      if (intersectPoints.length >= 2) {
        linePositions.push(
          intersectPoints[0].x, intersectPoints[0].y, intersectPoints[0].z,
          intersectPoints[1].x, intersectPoints[1].y, intersectPoints[1].z
        );
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  return lineGeometry;
}
