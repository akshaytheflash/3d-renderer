import * as THREE from 'three';
import { GeometryMetrics } from '../../types/configurator';

/**
 * Calculates real physical metrics for 3D printing:
 * - Manifold signed volume (cm³) via tetrahedron integration
 * - Surface area (cm²)
 * - Watertightness
 * - Bounding box (mm)
 * - Overhang percentage (> threshold angle)
 */
export function calculateGeometryMetrics(
  geometry: THREE.BufferGeometry,
  overhangThresholdDegrees: number = 45
): GeometryMetrics {
  const pos = geometry.attributes.position;
  const index = geometry.getIndex();

  if (!pos || pos.count === 0) {
    return {
      vertexCount: 0,
      faceCount: 0,
      volumeCm3: 0,
      surfaceAreaCm2: 0,
      isWatertight: false,
      boundingBox: { width: 0, depth: 0, height: 0 },
      printTimeMinutes: 0,
      filamentMassGrams: 0,
      estimatedCostUsd: 0,
      overhangWarningAreaPercentage: 0,
    };
  }

  geometry.computeBoundingBox();
  const bb = geometry.boundingBox || new THREE.Box3();
  const widthMm = Math.max(0, bb.max.x - bb.min.x);
  const heightMm = Math.max(0, bb.max.y - bb.min.y);
  const depthMm = Math.max(0, bb.max.z - bb.min.z);

  const numFaces = index ? index.count / 3 : pos.count / 3;
  let totalSignedVolumeMm3 = 0;
  let totalSurfaceAreaMm2 = 0;
  let overhangAreaMm2 = 0;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const edgeAB = new THREE.Vector3();
  const edgeAC = new THREE.Vector3();
  const normal = new THREE.Vector3();

  // Edge map for watertightness checking
  // Each edge (minIdx, maxIdx) in a closed 2-manifold must be shared by exactly 2 triangles
  const edgeCountMap = new Map<string, number>();
  let hasBoundaryEdges = false;

  const radOverhangThreshold = (overhangThresholdDegrees * Math.PI) / 180;
  // In our coordinates, Y is UP (perpendicular to print bed)
  // Bed normal pointing straight down is (0, -1, 0)
  // Angle with downward normal: face pointing straight down has dot = 1.0 (90° overhang)
  // Face pointing horizontally has dot = 0.0 (45° or 0° overhang depending on convention)

  for (let f = 0; f < numFaces; f++) {
    let iA = f * 3;
    let iB = f * 3 + 1;
    let iC = f * 3 + 2;

    if (index) {
      iA = index.getX(iA);
      iB = index.getX(iB);
      iC = index.getX(iC);
    }

    vA.fromBufferAttribute(pos, iA);
    vB.fromBufferAttribute(pos, iB);
    vC.fromBufferAttribute(pos, iC);

    // Signed volume of tetrahedron formed by origin (0,0,0) and triangle (A,B,C)
    // V = (A · (B × C)) / 6
    const crossX = vB.y * vC.z - vB.z * vC.y;
    const crossY = vB.z * vC.x - vB.x * vC.z;
    const crossZ = vB.x * vC.y - vB.y * vC.x;
    totalSignedVolumeMm3 += (vA.x * crossX + vA.y * crossY + vA.z * crossZ) / 6.0;

    // Face area: 0.5 * ||(B - A) x (C - A)||
    edgeAB.subVectors(vB, vA);
    edgeAC.subVectors(vC, vA);
    normal.crossVectors(edgeAB, edgeAC);
    const area = normal.length() * 0.5;
    totalSurfaceAreaMm2 += area;

    // Overhang check: face normal relative to DOWN vector (0, -1, 0)
    if (area > 1e-6) {
      normal.normalize();
      // dot with (0, -1, 0) is -normal.y
      // If -normal.y > sin(angle), it requires support
      // An overhang angle of 45° means normal is tilted more than 45° downward
      if (-normal.y > Math.sin(radOverhangThreshold) && vA.y > bb.min.y + 1.0) {
        overhangAreaMm2 += area;
      }
    }

    // Watertight topological edge tracking
    const registerEdge = (idx1: number, idx2: number) => {
      const k = idx1 < idx2 ? `${idx1}_${idx2}` : `${idx2}_${idx1}`;
      edgeCountMap.set(k, (edgeCountMap.get(k) || 0) + 1);
    };
    registerEdge(iA, iB);
    registerEdge(iB, iC);
    registerEdge(iC, iA);
  }

  // Check watertightness: no edge with count !== 2
  for (const count of edgeCountMap.values()) {
    if (count !== 2) {
      hasBoundaryEdges = true;
      break;
    }
  }

  const volumeCm3 = Math.max(0, Math.abs(totalSignedVolumeMm3) / 1000.0);
  const surfaceAreaCm2 = totalSurfaceAreaMm2 / 100.0;
  const overhangPercentage = totalSurfaceAreaMm2 > 0 ? (overhangAreaMm2 / totalSurfaceAreaMm2) * 100 : 0;

  return {
    vertexCount: pos.count,
    faceCount: numFaces,
    volumeCm3: parseFloat(volumeCm3.toFixed(2)),
    surfaceAreaCm2: parseFloat(surfaceAreaCm2.toFixed(2)),
    isWatertight: !hasBoundaryEdges,
    boundingBox: {
      width: Math.round(widthMm),
      depth: Math.round(depthMm),
      height: Math.round(heightMm),
    },
    printTimeMinutes: 0, // Will be computed in printEstimator
    filamentMassGrams: 0,
    estimatedCostUsd: 0,
    overhangWarningAreaPercentage: parseFloat(overhangPercentage.toFixed(1)),
  };
}
