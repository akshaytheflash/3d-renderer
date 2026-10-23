import * as THREE from 'three';
import { VaseParams } from '../../types/configurator';

/**
 * Generates watertight parametric vases and vessels with radial fluting,
 * axial twist, profile tapering, and optional solid interior wall for 3D printing.
 */
export function generateVaseGeometry(params: VaseParams): THREE.BufferGeometry {
  const {
    height,
    baseRadius,
    waistRadius,
    rimRadius,
    waistPosition,
    fluteCount,
    fluteDepth,
    twist,
    waveFrequency,
    waveAmplitude,
    wallThickness,
    isHollow,
    resolutionRadial,
    resolutionHeight,
  } = params;

  // Profile radius function along vertical axis t [0, 1]
  const getRadiusAtHeight = (t: number): number => {
    // Quadratic Bezier or Hermite interpolation between base, waist, and rim
    let r = 0;
    if (t < waistPosition) {
      const u = waistPosition > 0 ? t / waistPosition : 0;
      r = baseRadius + (waistRadius - baseRadius) * (1 - Math.cos(u * Math.PI * 0.5));
    } else {
      const u = waistPosition < 1 ? (t - waistPosition) / (1 - waistPosition) : 1;
      r = waistRadius + (rimRadius - waistRadius) * Math.sin(u * Math.PI * 0.5);
    }

    // Add axial wave perturbations
    if (waveFrequency > 0 && waveAmplitude > 0) {
      r += Math.sin(t * Math.PI * 2 * waveFrequency) * waveAmplitude;
    }

    return Math.max(r, 2.0); // Minimum 2mm radius to prevent degenerate mesh
  };

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Helper to add vertex
  const addVertex = (x: number, y: number, z: number, u: number, v: number) => {
    positions.push(x, y, z);
    uvs.push(u, v);
  };

  const radSegs = Math.max(resolutionRadial, 16);
  const hSegs = Math.max(resolutionHeight, 16);

  // 1. GENERATE OUTER SHELL
  for (let j = 0; j <= hSegs; j++) {
    const t = j / hSegs;
    const y = t * height;
    const baseR = getRadiusAtHeight(t);
    const currentTwist = t * twist;

    for (let i = 0; i <= radSegs; i++) {
      const u = i / radSegs;
      const angle = u * Math.PI * 2 + currentTwist;

      // Radial fluting calculation
      let fluting = 0;
      if (fluteCount > 0 && fluteDepth > 0) {
        fluting = Math.sin(angle * fluteCount) * fluteDepth;
      }
      const r = Math.max(baseR + fluting, 1.0);

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      addVertex(x, y, z, u, t);
    }
  }

  // Indices for outer shell
  for (let j = 0; j < hSegs; j++) {
    for (let i = 0; i < radSegs; i++) {
      const a = j * (radSegs + 1) + i;
      const b = (j + 1) * (radSegs + 1) + i;
      const c = (j + 1) * (radSegs + 1) + (i + 1);
      const d = j * (radSegs + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const outerVertexCount = (hSegs + 1) * (radSegs + 1);

  if (isHollow && wallThickness > 0.5) {
    // 2. GENERATE INNER SHELL (Inverted normals for hollow printable vase)
    const innerOffset = outerVertexCount;
    const floorThickness = Math.max(wallThickness * 1.5, 3.0); // Thick watertight floor

    for (let j = 0; j <= hSegs; j++) {
      const t = j / hSegs;
      const y = floorThickness + t * (height - floorThickness);
      const outerR = getRadiusAtHeight(t);
      const baseR = Math.max(outerR - wallThickness, 1.0);
      const currentTwist = t * twist;

      for (let i = 0; i <= radSegs; i++) {
        const u = i / radSegs;
        const angle = u * Math.PI * 2 + currentTwist;

        let fluting = 0;
        if (fluteCount > 0 && fluteDepth > 0) {
          // Attenuated inner fluting
          fluting = Math.sin(angle * fluteCount) * (fluteDepth * 0.7);
        }
        const r = Math.max(baseR + fluting, 0.8);

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        addVertex(x, y, z, u, t);
      }
    }

    // Indices for inner shell (facing inward)
    for (let j = 0; j < hSegs; j++) {
      for (let i = 0; i < radSegs; i++) {
        const a = innerOffset + j * (radSegs + 1) + i;
        const b = innerOffset + (j + 1) * (radSegs + 1) + i;
        const c = innerOffset + (j + 1) * (radSegs + 1) + (i + 1);
        const d = innerOffset + j * (radSegs + 1) + (i + 1);

        // Reverse winding order so normals point inward
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    // 3. BRIDGING RIM (Top Lip connecting outer rim to inner rim)
    const outerRimStart = hSegs * (radSegs + 1);
    const innerRimStart = innerOffset + hSegs * (radSegs + 1);

    for (let i = 0; i < radSegs; i++) {
      const o1 = outerRimStart + i;
      const o2 = outerRimStart + (i + 1);
      const i1 = innerRimStart + i;
      const i2 = innerRimStart + (i + 1);

      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    }

    // 4. INNER BOTTOM FLOOR CAP
    const innerFloorCenterIdx = positions.length / 3;
    addVertex(0, floorThickness, 0, 0.5, 0.5);

    const innerFloorStart = innerOffset;
    for (let i = 0; i < radSegs; i++) {
      const i1 = innerFloorStart + i;
      const i2 = innerFloorStart + (i + 1);
      indices.push(innerFloorCenterIdx, i2, i1);
    }

    // 5. OUTER BASE FLOOR CAP
    const outerBaseCenterIdx = positions.length / 3;
    addVertex(0, 0, 0, 0.5, 0.5);

    const outerBaseStart = 0;
    for (let i = 0; i < radSegs; i++) {
      const o1 = outerBaseStart + i;
      const o2 = outerBaseStart + (i + 1);
      indices.push(outerBaseCenterIdx, o1, o2);
    }
  } else {
    // SOLID VASE (Watertight bottom and top caps)
    // Bottom Cap
    const baseCenterIdx = positions.length / 3;
    addVertex(0, 0, 0, 0.5, 0.5);
    for (let i = 0; i < radSegs; i++) {
      indices.push(baseCenterIdx, i, i + 1);
    }

    // Top Cap
    const topCenterIdx = positions.length / 3;
    addVertex(0, height, 0, 0.5, 0.5);
    const topStart = hSegs * (radSegs + 1);
    for (let i = 0; i < radSegs; i++) {
      indices.push(topCenterIdx, topStart + (i + 1), topStart + i);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Center on X and Z axes, align base to Y = 0 for 3D printer bed
  geometry.center();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const minY = geometry.boundingBox.min.y;
    geometry.translate(0, -minY, 0);
  }

  return geometry;
}
