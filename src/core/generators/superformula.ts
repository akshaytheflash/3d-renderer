import * as THREE from 'three';
import { CustomParams } from '../../types/configurator';

/**
 * Gielis Superformula "Custom" Shape Generator
 *
 * Cross-section: r(θ) = ( |cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3 )^(−1/n1)
 * swept vertically with axial twist and linear taper into a guaranteed
 * watertight hollow shell (rim bridge + inner floor + outer base),
 * printable in vase or standard mode.
 */
export function generateSuperformula(params: CustomParams): THREE.BufferGeometry {
  const {
    m,
    a,
    b,
    n1,
    n2,
    n3,
    height,
    twist,
    taper,
    wallThickness,
    resolutionRadial,
    resolutionHeight,
  } = params;

  // Sanitize: m integer >= 2, n1 away from zero (else −1/n1 explodes),
  // scales strictly positive, resolution floors.
  const lobes = Math.max(Math.round(m), 2);
  const safeN1 = Math.max(Math.abs(n1), 0.05);
  const signN1 = n1 < 0 ? -1 : 1;
  const expN1 = signN1 / safeN1;
  const safeA = Math.max(a, 0.05);
  const safeB = Math.max(b, 0.05);
  const safeN2 = Math.max(n2, 0.05);
  const safeN3 = Math.max(n3, 0.05);

  const radSegs = Math.max(resolutionRadial, 16);
  const hSegs = Math.max(resolutionHeight, 16);
  const wall = Math.max(wallThickness, 1.0);

  // Raw superformula radius at polar angle θ
  const superRadius = (theta: number): number => {
    const t = (lobes * theta) / 4;
    const term1 = Math.pow(Math.abs(Math.cos(t) / safeA), safeN2);
    const term2 = Math.pow(Math.abs(Math.sin(t) / safeB), safeN3);
    const sum = term1 + term2;
    if (sum <= 1e-9) return 0;
    return Math.pow(sum, expN1);
  };

  // Normalize the largest cross-section radius to ~42mm so any parameter
  // combination stays on the print bed.
  let maxR = 0;
  for (let i = 0; i < 720; i++) {
    maxR = Math.max(maxR, superRadius((i / 720) * Math.PI * 2));
  }
  const targetRadius = 42.0;
  const scale = maxR > 1e-9 ? targetRadius / maxR : 1.0;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const addVertex = (x: number, y: number, z: number, u: number, v: number) => {
    positions.push(x, y, z);
    uvs.push(u, v);
  };

  // Outer radius at height fraction t and polar angle θ (profile rotated by twist)
  const outerRadiusAt = (t: number, theta: number): number => {
    const taperScale = 1.0 + (taper - 1.0) * t;
    const r = superRadius(theta - t * twist) * scale * taperScale;
    // Keep the outer wall thick enough that the inner shell never coincides
    return Math.max(r, wall + 1.5);
  };

  // 1. OUTER SHELL — each ring has exactly radSegs vertices, closed via % radSegs
  for (let j = 0; j <= hSegs; j++) {
    const t = j / hSegs;
    const y = t * height;
    for (let i = 0; i < radSegs; i++) {
      const u = i / radSegs;
      const angle = u * Math.PI * 2;
      const r = outerRadiusAt(t, angle);
      addVertex(Math.cos(angle) * r, y, Math.sin(angle) * r, u, t);
    }
  }

  // Indices for outer shell
  for (let j = 0; j < hSegs; j++) {
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      const aIdx = j * radSegs + i;
      const bIdx = (j + 1) * radSegs + i;
      const cIdx = (j + 1) * radSegs + nextI;
      const dIdx = j * radSegs + nextI;

      indices.push(aIdx, bIdx, dIdx);
      indices.push(bIdx, cIdx, dIdx);
    }
  }

  // 2. INNER SHELL (offset inward by wall thickness, facing inward)
  const innerOffset = positions.length / 3;
  const floorThickness = Math.max(wall * 1.5, 3.0);

  for (let j = 0; j <= hSegs; j++) {
    const t = j / hSegs;
    const y = floorThickness + t * (height - floorThickness);
    for (let i = 0; i < radSegs; i++) {
      const u = i / radSegs;
      const angle = u * Math.PI * 2;
      const outerR = outerRadiusAt(t, angle);
      const r = Math.max(outerR - wall, 0.8);
      addVertex(Math.cos(angle) * r, y, Math.sin(angle) * r, u, t);
    }
  }

  // Indices for inner shell (winding reversed)
  for (let j = 0; j < hSegs; j++) {
    for (let i = 0; i < radSegs; i++) {
      const nextI = (i + 1) % radSegs;
      const aIdx = innerOffset + j * radSegs + i;
      const bIdx = innerOffset + (j + 1) * radSegs + i;
      const cIdx = innerOffset + (j + 1) * radSegs + nextI;
      const dIdx = innerOffset + j * radSegs + nextI;

      indices.push(aIdx, dIdx, bIdx);
      indices.push(bIdx, dIdx, cIdx);
    }
  }

  // 3. BRIDGING RIM (top lip)
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
