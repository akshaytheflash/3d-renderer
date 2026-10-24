import * as THREE from 'three';
import { GeometryMetrics } from '../../types/configurator';

/**
 * Calculates real physical metrics for 3D printing:
 * - Manifold signed volume (cm³) via tetrahedron integration
 * - Surface area (cm²)
 * - Watertightness with spatial vertex edge quantization
 * - Boundary edge count & actionable diagnostic breakdown
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
      boundaryEdgeCount: 0,
      nonManifoldEdgeCount: 0,
      diagnosticSummary: 'Empty Geometry',
      diagnosticSuggestion: 'Generate or upload a 3D geometry to analyze.',
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

  // Spatial vertex key mapping to handle duplicate coincident vertices (e.g. UV seams)
  // Quantize coordinates to 0.02mm precision
  const quantize = (v: THREE.Vector3) =>
    `${Math.round(v.x * 50)}_${Math.round(v.y * 50)}_${Math.round(v.z * 50)}`;

  const edgeCountMap = new Map<string, number>();

  const radOverhangThreshold = (overhangThresholdDegrees * Math.PI) / 180;
  const sinOverhang = Math.sin(radOverhangThreshold);

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

    // Face area
    edgeAB.subVectors(vB, vA);
    edgeAC.subVectors(vC, vA);
    normal.crossVectors(edgeAB, edgeAC);
    const area = normal.length() * 0.5;
    totalSurfaceAreaMm2 += area;

    // Overhang check: downward face normal
    if (area > 1e-6) {
      normal.normalize();
      if (-normal.y > sinOverhang && vA.y > bb.min.y + 0.8) {
        overhangAreaMm2 += area;
      }
    }

    // Spatial edge tracking
    const kA = quantize(vA);
    const kB = quantize(vB);
    const kC = quantize(vC);

    const registerEdge = (p1: string, p2: string) => {
      if (p1 === p2) return; // ignore degenerate edge
      const k = p1 < p2 ? `${p1}|${p2}` : `${p2}|${p1}`;
      edgeCountMap.set(k, (edgeCountMap.get(k) || 0) + 1);
    };

    registerEdge(kA, kB);
    registerEdge(kB, kC);
    registerEdge(kC, kA);
  }

  // Count open boundary edges (edge count == 1) and non-manifold edges (edge count > 2)
  let boundaryEdges = 0;
  let nonManifoldEdges = 0;

  for (const count of edgeCountMap.values()) {
    if (count === 1) {
      boundaryEdges++;
    } else if (count > 2) {
      nonManifoldEdges++;
    }
  }

  const isWatertight = boundaryEdges === 0 && nonManifoldEdges === 0;

  let diagnosticSummary = 'Solid 2-Manifold Mesh';
  let diagnosticSuggestion = 'Geometry is closed, watertight, and 100% slice-ready for 3D printing.';

  if (!isWatertight) {
    if (boundaryEdges > 0) {
      diagnosticSummary = `${boundaryEdges} Open Boundary Edges Detected`;
      diagnosticSuggestion =
        'The surface contains open seams or uncapped openings. Click "Auto-Repair Topology" to seal open boundaries and generate watertight caps.';
    } else if (nonManifoldEdges > 0) {
      diagnosticSummary = `${nonManifoldEdges} Non-Manifold T-Junctions`;
      diagnosticSuggestion =
        'Internal intersecting walls detected. Slicers can usually autofix this or you can reduce wall thickness.';
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
    isWatertight,
    boundaryEdgeCount: boundaryEdges,
    nonManifoldEdgeCount: nonManifoldEdges,
    diagnosticSummary,
    diagnosticSuggestion,
    boundingBox: {
      width: Math.round(widthMm),
      depth: Math.round(depthMm),
      height: Math.round(heightMm),
    },
    printTimeMinutes: 0,
    filamentMassGrams: 0,
    estimatedCostUsd: 0,
    overhangWarningAreaPercentage: parseFloat(overhangPercentage.toFixed(1)),
  };
}
