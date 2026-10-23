import * as THREE from 'three';
import { SculptureParams } from '../../types/configurator';

/**
 * Generates Parametric Torus Knots and Mobius Sculptures
 * with variable tubular cross-sections, aero fin ribs, and flat print mounting base.
 */
export function generateSculptureGeometry(params: SculptureParams): THREE.BufferGeometry {
  const {
    radius,
    tubeRadius,
    p,
    q,
    tubularSegments,
    radialSegments,
    ribCount,
    ribDepth,
    twistFactor,
    sculptureShape,
  } = params;

  const tubSegs = Math.max(tubularSegments, 64);
  const radSegs = Math.max(radialSegments, 16);

  // Knot Curve function: given t in [0, 1], returns center position and tangent
  const getCurvePoint = (t: number): THREE.Vector3 => {
    const phi = t * Math.PI * 2;

    if (sculptureShape === 'mobius') {
      // 3D Ribbon Mobius path
      const r = radius * (1 + 0.3 * Math.cos(phi * 0.5));
      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const y = radius * 0.4 * Math.sin(phi * 0.5);
      return new THREE.Vector3(x, y, z);
    } else if (sculptureShape === 'spiral') {
      // Logarithmic Spiral Horn
      const turns = 2.5;
      const angle = phi * turns;
      const r = radius * (0.2 + 0.8 * t);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = (t - 0.5) * radius * 1.8;
      return new THREE.Vector3(x, y, z);
    } else {
      // Standard Torus Knot (p, q)
      const u = p * phi;
      const v = q * phi;
      const r = radius * (0.6 + 0.4 * Math.cos(v));
      const x = r * Math.cos(u);
      const y = radius * 0.5 * Math.sin(v);
      const z = r * Math.sin(u);
      return new THREE.Vector3(x, y, z);
    }
  };

  // Precompute curve samples and Frenet-Serret frames (tangent, normal, binormal)
  const points: THREE.Vector3[] = [];
  const tangents: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = [];
  const binormals: THREE.Vector3[] = [];

  for (let i = 0; i <= tubSegs; i++) {
    const t = i / tubSegs;
    points.push(getCurvePoint(t));
  }

  // Calculate tangents
  for (let i = 0; i <= tubSegs; i++) {
    const nextIdx = (i + 1) % tubSegs;
    const prevIdx = (i - 1 + tubSegs) % tubSegs;
    const tangent = new THREE.Vector3().subVectors(points[nextIdx], points[prevIdx]).normalize();
    tangents.push(tangent);
  }

  // Construct continuous reference frames along curve
  let currentNormal = new THREE.Vector3(0, 1, 0);
  if (Math.abs(tangents[0].dot(currentNormal)) > 0.9) {
    currentNormal = new THREE.Vector3(1, 0, 0);
  }
  let currentBinormal = new THREE.Vector3().crossVectors(tangents[0], currentNormal).normalize();
  currentNormal = new THREE.Vector3().crossVectors(currentBinormal, tangents[0]).normalize();

  normals.push(currentNormal.clone());
  binormals.push(currentBinormal.clone());

  for (let i = 1; i <= tubSegs; i++) {
    const prevT = tangents[i - 1];
    const currT = tangents[i];

    // Parallel transport frame
    const axis = new THREE.Vector3().crossVectors(prevT, currT);
    const angle = Math.acos(Math.max(-1, Math.min(1, prevT.dot(currT))));

    if (axis.lengthSq() > 1e-6) {
      axis.normalize();
      currentNormal.applyAxisAngle(axis, angle);
      currentBinormal.applyAxisAngle(axis, angle);
    }

    normals.push(currentNormal.clone());
    binormals.push(currentBinormal.clone());
  }

  // Mesh generation
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubSegs; i++) {
    const t = i / tubSegs;
    const center = points[i];
    const N = normals[i];
    const B = binormals[i];

    // Twist rotation along length
    const twistAngle = t * Math.PI * 2 * twistFactor;
    const cosTwist = Math.cos(twistAngle);
    const sinTwist = Math.sin(twistAngle);

    // Twisted local frame
    const rotN = new THREE.Vector3().addScaledVector(N, cosTwist).addScaledVector(B, sinTwist);
    const rotB = new THREE.Vector3().addScaledVector(N, -sinTwist).addScaledVector(B, cosTwist);

    // Tube radius variation
    const baseR = tubeRadius * (0.8 + 0.2 * Math.sin(t * Math.PI * 2 * (p || 3)));

    for (let j = 0; j <= radSegs; j++) {
      const u = j / radSegs;
      const theta = u * Math.PI * 2;

      // Radial ribbing modulation
      let ribOffset = 0;
      if (ribCount > 0 && ribDepth > 0) {
        ribOffset = Math.sin(theta * ribCount) * ribDepth;
      }
      const r = Math.max(baseR + ribOffset, 1.0);

      const vx = center.x + r * (Math.cos(theta) * rotN.x + Math.sin(theta) * rotB.x);
      const vy = center.y + r * (Math.cos(theta) * rotN.y + Math.sin(theta) * rotB.y);
      const vz = center.z + r * (Math.cos(theta) * rotN.z + Math.sin(theta) * rotB.z);

      positions.push(vx, vy, vz);
      uvs.push(t, u);
    }
  }

  // Stitch tube triangles
  for (let i = 0; i < tubSegs; i++) {
    for (let j = 0; j < radSegs; j++) {
      const a = i * (radSegs + 1) + j;
      const b = (i + 1) * (radSegs + 1) + j;
      const c = (i + 1) * (radSegs + 1) + (j + 1);
      const d = i * (radSegs + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Cap ends if spiral or open shape
  if (sculptureShape === 'spiral') {
    // Start cap
    const startCenter = points[0];
    const startIdx = positions.length / 3;
    positions.push(startCenter.x, startCenter.y, startCenter.z);
    uvs.push(0, 0.5);
    for (let j = 0; j < radSegs; j++) {
      indices.push(startIdx, j + 1, j);
    }

    // End cap
    const endCenter = points[tubSegs];
    const endIdx = positions.length / 3;
    positions.push(endCenter.x, endCenter.y, endCenter.z);
    uvs.push(1, 0.5);
    const endOffset = tubSegs * (radSegs + 1);
    for (let j = 0; j < radSegs; j++) {
      indices.push(endIdx, endOffset + j, endOffset + (j + 1));
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Re-orient and add flat stable 3D printing pedestal/pad at the bottom
  geometry.center();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const minY = geometry.boundingBox.min.y;
    geometry.translate(0, -minY, 0);
  }

  return geometry;
}
