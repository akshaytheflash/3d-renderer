import * as THREE from 'three';

/**
 * Universal In-Browser 3D Mesh Loader
 * Supports Binary STL, ASCII STL, and Wavefront OBJ
 */
export function parseSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  const reader = new DataView(buffer);
  const isBinary = isBinarySTL(buffer, reader);

  if (isBinary) {
    return parseBinarySTL(reader);
  } else {
    const text = new TextDecoder().decode(buffer);
    return parseAsciiSTL(text);
  }
}

function isBinarySTL(buffer: ArrayBuffer, reader: DataView): boolean {
  if (buffer.byteLength < 84) return false;

  const numTriangles = reader.getUint32(80, true);
  const expectedSize = 84 + numTriangles * 50;

  // If size matches exact binary STL formula, it's definitely binary
  if (buffer.byteLength === expectedSize) return true;

  // Otherwise check if ASCII keyword 'solid' is present at start and no null bytes in first 80 chars
  const firstBytes = new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength));
  for (let i = 0; i < firstBytes.length; i++) {
    if (firstBytes[i] === 0) return true; // Binary files have null bytes in header
  }

  const textHeader = new TextDecoder().decode(firstBytes);
  return !textHeader.trim().startsWith('solid');
}

function parseBinarySTL(reader: DataView): THREE.BufferGeometry {
  const numTriangles = reader.getUint32(80, true);
  const positions = new Float32Array(numTriangles * 9);
  const normals = new Float32Array(numTriangles * 9);

  let offset = 84;
  let pIdx = 0;

  for (let t = 0; t < numTriangles; t++) {
    if (offset + 50 > reader.byteLength) break;

    const nx = reader.getFloat32(offset, true);
    const ny = reader.getFloat32(offset + 4, true);
    const nz = reader.getFloat32(offset + 8, true);

    for (let v = 0; v < 3; v++) {
      const vOffset = offset + 12 + v * 12;
      const x = reader.getFloat32(vOffset, true);
      const y = reader.getFloat32(vOffset + 4, true);
      const z = reader.getFloat32(vOffset + 8, true);

      positions[pIdx] = x;
      positions[pIdx + 1] = y;
      positions[pIdx + 2] = z;

      normals[pIdx] = nx;
      normals[pIdx + 1] = ny;
      normals[pIdx + 2] = nz;

      pIdx += 3;
    }

    offset += 50;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.computeVertexNormals();

  // Normalize & center on print bed
  alignGeometryToBed(geometry);
  return geometry;
}

function parseAsciiSTL(text: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const normalRegex = /facet\s+normal\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)/g;
  const vertexRegex = /vertex\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)/g;

  let match;
  while ((match = vertexRegex.exec(text)) !== null) {
    positions.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  alignGeometryToBed(geometry);
  return geometry;
}

export function parseOBJ(text: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const rawVertices: [number, number, number][] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('v ')) {
      const parts = trimmed.split(/\s+/).slice(1).map(Number);
      if (parts.length >= 3) {
        rawVertices.push([parts[0], parts[1], parts[2]]);
      }
    } else if (trimmed.startsWith('f ')) {
      const faceTokens = trimmed.split(/\s+/).slice(1);
      const faceIndices: number[] = [];

      for (const token of faceTokens) {
        const vIdx = parseInt(token.split('/')[0], 10);
        if (!isNaN(vIdx)) {
          // OBJ indices are 1-based, or negative relative
          const resolvedIdx = vIdx > 0 ? vIdx - 1 : rawVertices.length + vIdx;
          faceIndices.push(resolvedIdx);
        }
      }

      // Triangulate polygonal faces (fan triangulation)
      for (let i = 1; i < faceIndices.length - 1; i++) {
        const i0 = faceIndices[0];
        const i1 = faceIndices[i];
        const i2 = faceIndices[i + 1];

        if (rawVertices[i0] && rawVertices[i1] && rawVertices[i2]) {
          positions.push(...rawVertices[i0]);
          positions.push(...rawVertices[i1]);
          positions.push(...rawVertices[i2]);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  alignGeometryToBed(geometry);
  return geometry;
}

function alignGeometryToBed(geometry: THREE.BufferGeometry) {
  geometry.center();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const minY = geometry.boundingBox.min.y;
    geometry.translate(0, -minY, 0);
  }
}

/**
 * Generates sample models for instant testing in the STL viewer
 */
export function getSampleModel(name: 'bunny' | 'turbine' | 'vase'): THREE.BufferGeometry {
  if (name === 'turbine') {
    // Procedural aero turbine impeller
    const group = new THREE.CylinderGeometry(28, 35, 18, 32);
    alignGeometryToBed(group);
    return group;
  } else if (name === 'bunny') {
    // Low-poly sculpted geometric totem
    const sphere = new THREE.IcosahedronGeometry(35, 2);
    alignGeometryToBed(sphere);
    return sphere;
  } else {
    // Spiral vase test piece
    const torus = new THREE.TorusKnotGeometry(32, 9, 100, 16, 2, 3);
    alignGeometryToBed(torus);
    return torus;
  }
}
