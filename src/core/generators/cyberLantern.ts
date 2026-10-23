import * as THREE from 'three';
import { LanternParams } from '../../types/configurator';

/**
 * Procedural Cybernetic Cellular Lantern
 * Generates an architectural lantern/lamp with support-free overhang windows,
 * hollow interior for LED installation, and stable print base.
 */
export function generateLanternGeometry(params: LanternParams): THREE.BufferGeometry {
  const {
    height,
    radiusBottom,
    radiusTop,
    cellColumns,
    cellRows,
    apertureSize,
    wallThickness,
    twistAngle,
    capTop,
    innerCavity,
  } = params;

  const cols = Math.max(cellColumns, 6);
  const rows = Math.max(cellRows, 4);
  const floorHeight = 4.0; // 4mm solid base
  const effectiveHeight = height - floorHeight;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Compute radius at vertical position t [0, 1]
  const getRadius = (t: number): number => {
    return radiusBottom + (radiusTop - radiusBottom) * (Math.sin(t * Math.PI * 0.5));
  };

  // Helper to add quad
  const addQuad = (
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    p4: THREE.Vector3
  ) => {
    const start = positions.length / 3;
    positions.push(p1.x, p1.y, p1.z);
    positions.push(p2.x, p2.y, p2.z);
    positions.push(p3.x, p3.y, p3.z);
    positions.push(p4.x, p4.y, p4.z);

    indices.push(start, start + 1, start + 2);
    indices.push(start, start + 2, start + 3);
  };

  // 1. SOLID BOTTOM BASE DISC
  const baseSegments = cols * 4;
  const baseCenter = new THREE.Vector3(0, 0, 0);
  const baseTopCenter = new THREE.Vector3(0, floorHeight, 0);

  const baseBottomStart = positions.length / 3;
  positions.push(baseCenter.x, baseCenter.y, baseCenter.z);

  for (let i = 0; i < baseSegments; i++) {
    const angle = (i / baseSegments) * Math.PI * 2;
    const r = radiusBottom;
    positions.push(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  }

  for (let i = 0; i < baseSegments; i++) {
    const next = (i + 1) % baseSegments;
    indices.push(baseBottomStart, baseBottomStart + 1 + i, baseBottomStart + 1 + next);
  }

  // Base Rim walls
  for (let i = 0; i < baseSegments; i++) {
    const next = (i + 1) % baseSegments;
    const a1 = (i / baseSegments) * Math.PI * 2;
    const a2 = (next / baseSegments) * Math.PI * 2;
    const r = radiusBottom;

    const b1 = new THREE.Vector3(Math.cos(a1) * r, 0, Math.sin(a1) * r);
    const b2 = new THREE.Vector3(Math.cos(a2) * r, 0, Math.sin(a2) * r);
    const t1 = new THREE.Vector3(Math.cos(a1) * r, floorHeight, Math.sin(a1) * r);
    const t2 = new THREE.Vector3(Math.cos(a2) * r, floorHeight, Math.sin(a2) * r);

    addQuad(b1, t1, t2, b2);
  }

  // 2. CELLULAR TOWER STRUTS & WINDOWS
  const rowHeight = effectiveHeight / rows;
  const colAngle = (Math.PI * 2) / cols;

  for (let r = 0; r < rows; r++) {
    const t0 = r / rows;
    const t1 = (r + 1) / rows;
    const y0 = floorHeight + t0 * effectiveHeight;
    const y1 = floorHeight + t1 * effectiveHeight;
    const rad0 = getRadius(t0);
    const rad1 = getRadius(t1);

    const twist0 = t0 * twistAngle;
    const twist1 = t1 * twistAngle;

    for (let c = 0; c < cols; c++) {
      const a0_0 = c * colAngle + twist0;
      const a0_1 = (c + 1) * colAngle + twist0;
      const a1_0 = c * colAngle + twist1;
      const a1_1 = (c + 1) * colAngle + twist1;

      // Outer Corner Points of this cellular window
      const P00 = new THREE.Vector3(Math.cos(a0_0) * rad0, y0, Math.sin(a0_0) * rad0);
      const P01 = new THREE.Vector3(Math.cos(a0_1) * rad0, y0, Math.sin(a0_1) * rad0);
      const P10 = new THREE.Vector3(Math.cos(a1_0) * rad1, y1, Math.sin(a1_0) * rad1);
      const P11 = new THREE.Vector3(Math.cos(a1_1) * rad1, y1, Math.sin(a1_1) * rad1);

      // Inner Corner Points (with wall thickness)
      const rad0_in = Math.max(rad0 - wallThickness, 1.0);
      const rad1_in = Math.max(rad1 - wallThickness, 1.0);

      const Q00 = new THREE.Vector3(Math.cos(a0_0) * rad0_in, y0, Math.sin(a0_0) * rad0_in);
      const Q01 = new THREE.Vector3(Math.cos(a0_1) * rad0_in, y0, Math.sin(a0_1) * rad0_in);
      const Q10 = new THREE.Vector3(Math.cos(a1_0) * rad1_in, y1, Math.sin(a1_0) * rad1_in);
      const Q11 = new THREE.Vector3(Math.cos(a1_1) * rad1_in, y1, Math.sin(a1_1) * rad1_in);

      // Strut thickness fraction: apertureSize in [0.2, 0.8]
      // Support-free diamond aperture: center cutout
      const frameFrac = (1.0 - apertureSize) * 0.5;

      // Window Opening Vertices (Diamond/Hex shaped for 45° overhang printability)
      const midY = (y0 + y1) * 0.5;
      const midRad = (rad0 + rad1) * 0.5;
      const midTwist = (twist0 + twist1) * 0.5;
      const midA_center = (c + 0.5) * colAngle + midTwist;
      const midA_left = (c + frameFrac) * colAngle + midTwist;
      const midA_right = (c + 1 - frameFrac) * colAngle + midTwist;

      // Outer window vertices
      const W_Top = new THREE.Vector3(Math.cos(midA_center) * rad1, y1 - rowHeight * frameFrac, Math.sin(midA_center) * rad1);
      const W_Bot = new THREE.Vector3(Math.cos(midA_center) * rad0, y0 + rowHeight * frameFrac, Math.sin(midA_center) * rad0);
      const W_Left = new THREE.Vector3(Math.cos(midA_left) * midRad, midY, Math.sin(midA_left) * midRad);
      const W_Right = new THREE.Vector3(Math.cos(midA_right) * midRad, midY, Math.sin(midA_right) * midRad);

      // Outer border triangles around diamond window
      // Bottom left corner
      addQuad(P00, W_Bot, W_Left, P00);
      // Bottom right corner
      addQuad(W_Bot, P01, P01, W_Right);
      // Top left corner
      addQuad(W_Left, W_Top, P10, P10);
      // Top right corner
      addQuad(W_Right, P11, P11, W_Top);

      // Window reveals (Jambs / sills connecting outer window to inner window)
      const midRad_in = Math.max(midRad - wallThickness, 1.0);
      const rad1_in_top = Math.max(rad1 - wallThickness, 1.0);
      const rad0_in_bot = Math.max(rad0 - wallThickness, 1.0);

      const IW_Top = new THREE.Vector3(Math.cos(midA_center) * rad1_in_top, y1 - rowHeight * frameFrac, Math.sin(midA_center) * rad1_in_top);
      const IW_Bot = new THREE.Vector3(Math.cos(midA_center) * rad0_in_bot, y0 + rowHeight * frameFrac, Math.sin(midA_center) * rad0_in_bot);
      const IW_Left = new THREE.Vector3(Math.cos(midA_left) * midRad_in, midY, Math.sin(midA_left) * midRad_in);
      const IW_Right = new THREE.Vector3(Math.cos(midA_right) * midRad_in, midY, Math.sin(midA_right) * midRad_in);

      // 4 Window Sill/Jamb quads
      addQuad(W_Bot, IW_Bot, IW_Left, W_Left);
      addQuad(W_Left, IW_Left, IW_Top, W_Top);
      addQuad(W_Top, IW_Top, IW_Right, W_Right);
      addQuad(W_Right, IW_Right, IW_Bot, W_Bot);

      // Inner wall quads (facing inward)
      addQuad(Q00, Q10, IW_Left, Q00);
      addQuad(Q01, IW_Right, Q11, Q01);
      addQuad(IW_Bot, IW_Right, IW_Left, IW_Bot);
      addQuad(IW_Top, IW_Left, IW_Right, IW_Top);
    }
  }

  // 3. TOP CROWN / RIM
  const topSegments = cols * 4;
  const topY = height;
  const rTop = radiusTop;
  const rTopIn = Math.max(radiusTop - wallThickness, 1.0);

  for (let i = 0; i < topSegments; i++) {
    const next = (i + 1) % topSegments;
    const a1 = (i / topSegments) * Math.PI * 2 + twistAngle;
    const a2 = (next / topSegments) * Math.PI * 2 + twistAngle;

    const o1 = new THREE.Vector3(Math.cos(a1) * rTop, topY, Math.sin(a1) * rTop);
    const o2 = new THREE.Vector3(Math.cos(a2) * rTop, topY, Math.sin(a2) * rTop);
    const i1 = new THREE.Vector3(Math.cos(a1) * rTopIn, topY, Math.sin(a1) * rTopIn);
    const i2 = new THREE.Vector3(Math.cos(a2) * rTopIn, topY, Math.sin(a2) * rTopIn);

    addQuad(o1, o2, i2, i1);
  }

  if (capTop) {
    const crownCenter = new THREE.Vector3(0, topY, 0);
    const crownCenterIdx = positions.length / 3;
    positions.push(crownCenter.x, crownCenter.y, crownCenter.z);

    for (let i = 0; i < topSegments; i++) {
      const a = (i / topSegments) * Math.PI * 2 + twistAngle;
      positions.push(Math.cos(a) * rTop, topY, Math.sin(a) * rTop);
    }

    for (let i = 0; i < topSegments; i++) {
      const next = (i + 1) % topSegments;
      indices.push(crownCenterIdx, crownCenterIdx + 1 + next, crownCenterIdx + 1 + i);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  geometry.center();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    geometry.translate(0, -geometry.boundingBox.min.y, 0);
  }

  return geometry;
}
