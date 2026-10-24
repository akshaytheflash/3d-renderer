import * as THREE from 'three';

/**
 * Conservative topology auto-repair for generated / imported meshes:
 * 1. Fuses coincident vertices (0.02mm quantization, identical to volumeCalculator)
 * 2. Drops degenerate triangles
 * 3. Seals open boundary loops with centroid-fan caps
 *
 * Returns null when the mesh is already watertight (nothing to repair).
 */
export function sealBoundaryEdges(geometry: THREE.BufferGeometry): THREE.BufferGeometry | null {
  const pos = geometry.attributes.position as THREE.BufferAttribute | undefined;
  if (!pos || pos.count === 0) return null;
  const index = geometry.getIndex();

  const numFaces = Math.floor((index ? index.count : pos.count) / 3);
  const QUANT_SCALE = 50; // 0.02mm buckets, identical to volumeCalculator

  const keyOf = (x: number, y: number, z: number) =>
    `${Math.round(x * QUANT_SCALE)}_${Math.round(y * QUANT_SCALE)}_${Math.round(z * QUANT_SCALE)}`;

  // ---- Pass 1: fuse coincident vertices into canonical representatives ----
  const canonical: number[] = new Array(pos.count);
  const positions: number[] = [];
  const repByKey = new Map<string, number>();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const key = keyOf(x, y, z);
    let c = repByKey.get(key);
    if (c === undefined) {
      c = positions.length / 3;
      repByKey.set(key, c);
      positions.push(x, y, z);
    }
    canonical[i] = c;
  }

  // ---- Pass 2: rebuild triangles, track edge usage ----
  const triangles: number[] = [];
  const edgeCount = new Map<string, number>();
  const edgeToTriangle = new Map<string, number>(); // edge key -> triangle offset in `triangles`

  const registerEdge = (a: number, b: number, t: number) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
    if (!edgeToTriangle.has(key)) edgeToTriangle.set(key, t);
  };

  for (let f = 0; f < numFaces; f++) {
    let a = f * 3;
    let b = f * 3 + 1;
    let c = f * 3 + 2;
    if (index) {
      a = index.getX(a);
      b = index.getX(b);
      c = index.getX(c);
    }
    a = canonical[a];
    b = canonical[b];
    c = canonical[c];
    if (a === b || b === c || a === c) continue; // degenerate after fusion
    registerEdge(a, b, triangles.length);
    registerEdge(b, c, triangles.length);
    registerEdge(c, a, triangles.length);
    triangles.push(a, b, c);
  }

  // ---- Pass 3: collect boundary edges (used by exactly one face) ----
  const boundaryEdges: Array<{ key: string; a: number; b: number }> = [];
  for (const [key, count] of edgeCount) {
    if (count === 1) {
      const [a, b] = key.split('|');
      boundaryEdges.push({ key, a: Number(a), b: Number(b) });
    }
  }
  if (boundaryEdges.length === 0) return null; // already watertight

  const adjacency = new Map<number, number[]>();
  for (const { a, b } of boundaryEdges) {
    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);
    adjacency.get(a)!.push(b);
    adjacency.get(b)!.push(a);
  }

  // Trace boundary loops by walking the edge chains
  const usedEdges = new Set<string>();
  const edgeKey = (u: number, v: number) => (u < v ? `${u}|${v}` : `${v}|${u}`);
  const loops: number[][] = [];

  for (const start of boundaryEdges) {
    if (usedEdges.has(start.key)) continue;
    const loop = [start.a, start.b];
    usedEdges.add(start.key);
    let prev = start.a;
    let current = start.b;

    while (true) {
      const neighbors = adjacency.get(current) || [];
      const next = neighbors.find((n) => n !== prev);
      if (next === undefined) break; // dangling chain (cannot happen on a closed loop)
      usedEdges.add(edgeKey(current, next));
      if (next === loop[0]) break; // loop closed
      loop.push(next);
      prev = current;
      current = next;
    }

    if (loop.length >= 3) loops.push(loop);
  }

  // ---- Pass 4: orient each cap to continue the rim's outward direction ----
  // Sum of face normals adjacent to the loop's boundary edges
  const rimNormal = new THREE.Vector3();
  const tmpN = new THREE.Vector3();
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();

  const loopNormal = (loop: number[]) => {
    // Newell's method for the loop plane normal
    const n = new THREE.Vector3();
    for (let i = 0; i < loop.length; i++) {
      const p = loop[i];
      const q = loop[(i + 1) % loop.length];
      n.x += (positions[p * 3 + 1] - positions[q * 3 + 1]) * (positions[p * 3 + 2] + positions[q * 3 + 2]);
      n.y += (positions[p * 3 + 2] - positions[q * 3 + 2]) * (positions[p * 3] + positions[q * 3]);
      n.z += (positions[p * 3] - positions[q * 3]) * (positions[p * 3 + 1] + positions[q * 3 + 1]);
    }
    return n;
  };

  // ---- Pass 5: cap each loop with a centroid fan ----
  const result = new THREE.BufferGeometry();
  const outTriangles = [...triangles];

  for (const loop of loops) {
    // Accumulate normals of faces adjoining this loop
    rimNormal.set(0, 0, 0);
    for (let i = 0; i < loop.length; i++) {
      const key = edgeKey(loop[i], loop[(i + 1) % loop.length]);
      const t = edgeToTriangle.get(key);
      if (t === undefined) continue;
      const a = triangles[t];
      const b = triangles[t + 1];
      const c = triangles[t + 2];
      vA.set(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
      vB.set(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
      vC.set(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]);
      e1.subVectors(vB, vA);
      e2.subVectors(vC, vA);
      rimNormal.add(tmpN.crossVectors(e1, e2));
    }

    const n = loopNormal(loop);
    if (n.dot(rimNormal) < 0) loop.reverse();

    // Centroid of loop vertices
    let cx = 0, cy = 0, cz = 0;
    for (const vi of loop) {
      cx += positions[vi * 3];
      cy += positions[vi * 3 + 1];
      cz += positions[vi * 3 + 2];
    }
    const centroidIndex = positions.length / 3;
    positions.push(cx / loop.length, cy / loop.length, cz / loop.length);

    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      if (a === b || a === centroidIndex || b === centroidIndex) continue;
      outTriangles.push(a, b, centroidIndex);
    }
  }

  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  result.setIndex(outTriangles);
  result.computeVertexNormals();
  result.computeBoundingBox();
  return result;
}
