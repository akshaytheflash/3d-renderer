import * as THREE from 'three';
import { VaseParams } from '../../types/configurator';

/**
 * Generates guaranteed watertight 2-manifold parametric vases and vessels
 * with radial fluting, axial twist, profile tapering, and solid or hollow wall.
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

  const radSegs = Math.max(resolutionRadial, 16);
  const hSegs = Math.max(resolutionHeight, 16);

  // Profile radius along vertical axis t [0, 1]
  const getRadiusAtHeight = (t: number): number => {
    let r = 0;
    if (t < waistPosition) {
      const u = waistPosition > 0 ? t / waistPosition : 0;
      r = baseRadius + (waistRadius - baseRadius) * (1 - Math.cos(u * Math.PI * 0.5));
    } else {
      const u = waistPosition < 1 ? (t - waistPosition) / (1 - waistPosition) : 1;
      r = waistRadius + (rimRadius - waistRadius) * Math.sin(u * Math.PI * 0.5);
    }

    if (waveFrequency > 0 && waveAmplitude > 0) {
      r += Math.sin(t * Math.PI * 2 * waveFrequency) * waveAmplitude;
    }

    return Math.max(r, 2.0);
  };

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const addVertex = (x: number, y: number, z: number, u: number, v: number) => {
    positions.push(x, y, z);
    uvs.push(u, v);
  };

  // 1. GENERATE OUTER SHELL
  // Each ring has exactly radSegs vertices (0 to radSegs - 1), closed via % radSegs
  for (let j = 0; j <= hSegs; j++) {
    const t = j / hSegs;
    const y = t * height;
    const baseR = getRadiusAtHeight(t);
    const currentTwist = t * twist;

    for (let i = 0; i < radSegs; i++) {
      const u = i / radSegs;
      const angle = u * Math.PI * 2 + currentTwist;

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
      const nextI = (i + 1) % radSegs;
      const a = j * radSegs + i;
      const b = (j + 1) * radSegs + i;
      const c = (j + 1) * radSegs + nextI;
      const d = j * radSegs + nextI;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const outerVertexCount = (hSegs + 1) * radSegs;

  if (isHollow && wallThickness > 0.5) {
    // 2. INNER SHELL FOR HOLLOW 3D PRINT
    const innerOffset = positions.length / 3;
    const floorThickness = Math.max(wallThickness * 1.5, 3.0);

    for (let j = 0; j <= hSegs; j++) {
      const t = j / hSegs;
      const y = floorThickness + t * (height - floorThickness);
      const outerR = getRadiusAtHeight(t);
      const baseR = Math.max(outerR - wallThickness, 1.0);
      const currentTwist = t * twist;

      for (let i = 0; i < radSegs; i++) {
        const u = i / radSegs;
        const angle = u * Math.PI * 2 + currentTwist;

        let fluting = 0;
        if (fluteCount > 0 && fluteDepth > 0) {
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
        const nextI = (i + 1) % radSegs;
        const a = innerOffset + j * radSegs + i;
        const b = innerOffset + (j + 1) * radSegs + i;
        const c = innerOffset + (j + 1) * radSegs + nextI;
        const d = innerOffset + j * radSegs + nextI;

        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    // 3. BRIDGING RIM (Top Lip)
    const outerRimStart = hSegs * radSegs;
    const innerRimStart = innerOffset + hSegs * radSegs;

    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      const o1 = outerRimStart + i;
      const o2 = outerRimStart + nextI;
      const i1 = innerRimStart + i;
      const i2 = innerRimStart + nextI;

      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    }

    // 4. INNER BOTTOM FLOOR CAP
    const innerFloorCenterIdx = positions.length / 3;
    addVertex(0, floorThickness, 0, 0.5, 0.5);

    const innerFloorStart = innerOffset;
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      indices.push(innerFloorCenterIdx, innerFloorStart + nextI, innerFloorStart + i);
    }

    // 5. OUTER BASE FLOOR CAP
    const outerBaseCenterIdx = positions.length / 3;
    addVertex(0, 0, 0, 0.5, 0.5);

    const outerBaseStart = 0;
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      indices.push(outerBaseCenterIdx, outerBaseStart + i, outerBaseStart + nextI);
    }
  } else {
    // SOLID VASE
    // Bottom Cap
    const baseCenterIdx = positions.length / 3;
    addVertex(0, 0, 0, 0.5, 0.5);
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      indices.push(baseCenterIdx, i, nextI);
    }

    // Top Cap
    const topCenterIdx = positions.length / 3;
    addVertex(0, height, 0, 0.5, 0.5);
    const topStart = hSegs * radSegs;
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      indices.push(topCenterIdx, topStart + nextI, topStart + i);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  geometry.center();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const minY = geometry.boundingBox.min.y;
    geometry.translate(0, -minY, 0);
  }

  return geometry;
}
