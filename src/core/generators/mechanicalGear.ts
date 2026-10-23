import * as THREE from 'three';
import { GearParams } from '../../types/configurator';

/**
 * Procedural Involute Spur & Helical Gear Generator
 * Calculates precise tooth profiles according to mechanical engineering standards,
 * with center shaft bore, keyway, spoke cutouts, and helical pitch.
 */
export function generateGearGeometry(params: GearParams): THREE.BufferGeometry {
  const {
    toothCount,
    module,
    pressureAngle,
    faceWidth,
    boreDiameter,
    hubDiameter,
    hubHeight,
    hasKeyway,
    keywayWidth,
    keywayDepth,
    spokeCount,
    rimThickness,
    helixAngle,
  } = params;

  // Standard Involute Gear Formulas
  const pitchDiameter = toothCount * module;
  const pitchRadius = pitchDiameter / 2;
  const phi = (pressureAngle * Math.PI) / 180; // pressure angle in radians
  const baseRadius = pitchRadius * Math.cos(phi);
  const addendum = module * 1.0;
  const dedendum = module * 1.25;
  const tipRadius = pitchRadius + addendum;
  const rootRadius = Math.max(pitchRadius - dedendum, boreDiameter / 2 + 3);

  // Involute profile generator: x = rb*(cos t + t*sin t), y = rb*(sin t - t*cos t)
  const getInvolutePoint = (t: number): [number, number] => {
    const x = baseRadius * (Math.cos(t) + t * Math.sin(t));
    const y = baseRadius * (Math.sin(t) - t * Math.cos(t));
    return [x, y];
  };

  // Find parameter t corresponding to a given radius r
  const findTForRadius = (r: number): number => {
    if (r <= baseRadius) return 0;
    return Math.sqrt((r * r) / (baseRadius * baseRadius) - 1);
  };

  const tMax = findTForRadius(tipRadius);
  const toothAngle = (Math.PI * 2) / toothCount;
  const halfToothThicknessAngle = Math.PI / (2 * toothCount);

  // Build 2D Gear Perimeter Contour (Outer Boundary)
  const shape = new THREE.Shape();
  const outerPoints: THREE.Vector2[] = [];

  for (let i = 0; i < toothCount; i++) {
    const angleOffset = i * toothAngle;

    // Root fillet/space start
    const aRoot1 = angleOffset - halfToothThicknessAngle * 1.8;
    outerPoints.push(new THREE.Vector2(Math.cos(aRoot1) * rootRadius, Math.sin(aRoot1) * rootRadius));

    // Involute rising flank
    const samples = 4;
    for (let s = 0; s <= samples; s++) {
      const t = (s / samples) * tMax;
      const [ix, iy] = getInvolutePoint(t);
      const angle = Math.atan2(iy, ix) + angleOffset - halfToothThicknessAngle;
      const r = Math.sqrt(ix * ix + iy * iy);
      outerPoints.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }

    // Tooth tip arc
    const aTipCenter = angleOffset;
    outerPoints.push(new THREE.Vector2(Math.cos(aTipCenter) * tipRadius, Math.sin(aTipCenter) * tipRadius));

    // Involute falling flank (mirrored)
    for (let s = samples; s >= 0; s--) {
      const t = (s / samples) * tMax;
      const [ix, iy] = getInvolutePoint(t);
      const angle = -(Math.atan2(iy, ix)) + angleOffset + halfToothThicknessAngle;
      const r = Math.sqrt(ix * ix + iy * iy);
      outerPoints.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }

    // Root fillet/space end
    const aRoot2 = angleOffset + halfToothThicknessAngle * 1.8;
    outerPoints.push(new THREE.Vector2(Math.cos(aRoot2) * rootRadius, Math.sin(aRoot2) * rootRadius));
  }

  shape.setFromPoints(outerPoints);
  shape.closePath();

  // Create Center Bore and Keyway Hole
  const boreRadius = Math.max(boreDiameter / 2, 2.0);
  const boreHole = new THREE.Path();

  if (hasKeyway && keywayWidth > 0 && keywayDepth > 0) {
    const kw = Math.min(keywayWidth, boreRadius * 1.2);
    const kd = keywayDepth;
    const halfKw = kw / 2;
    const topY = boreRadius + kd;

    // Bore perimeter with top keyway notch
    const startAngle = Math.asin(halfKw / boreRadius);
    boreHole.absarc(0, 0, boreRadius, startAngle, Math.PI - startAngle, false);
    boreHole.lineTo(-halfKw, topY);
    boreHole.lineTo(halfKw, topY);
    boreHole.lineTo(halfKw, Math.cos(startAngle) * boreRadius);
    boreHole.closePath();
  } else {
    boreHole.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
  }
  shape.holes.push(boreHole);

  // Spoke / Lightening Cutouts
  if (spokeCount >= 3 && rootRadius > boreRadius * 2.5) {
    const spokeInnerR = Math.max(boreRadius * 1.5, hubDiameter / 2 + 2);
    const spokeOuterR = rootRadius - rimThickness;

    if (spokeOuterR > spokeInnerR + 4) {
      const spokeAngleStep = (Math.PI * 2) / spokeCount;
      const webAngle = (spokeAngleStep * 0.35); // width of spoke web

      for (let s = 0; s < spokeCount; s++) {
        const startA = s * spokeAngleStep + webAngle / 2;
        const endA = (s + 1) * spokeAngleStep - webAngle / 2;

        const spokeHole = new THREE.Path();
        spokeHole.absarc(0, 0, spokeInnerR, startA, endA, false);
        spokeHole.lineTo(Math.cos(endA) * spokeOuterR, Math.sin(endA) * spokeOuterR);
        spokeHole.absarc(0, 0, spokeOuterR, endA, startA, true);
        spokeHole.closePath();

        shape.holes.push(spokeHole);
      }
    }
  }

  // Extrude shape with bevel for 3D print chamfer
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: helixAngle !== 0 ? 12 : 2,
    depth: faceWidth,
    bevelEnabled: true,
    bevelThickness: Math.min(module * 0.25, 1.2),
    bevelSize: Math.min(module * 0.2, 1.0),
    bevelSegments: 2,
  };

  const gearGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Apply helical twist if helixAngle != 0
  if (helixAngle !== 0) {
    const pos = gearGeometry.attributes.position;
    const twistPerZ = ((helixAngle * Math.PI) / 180) / pitchRadius;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const angle = z * twistPerZ;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      pos.setXY(i, x * cosA - y * sinA, x * sinA + y * cosA);
    }
    gearGeometry.computeVertexNormals();
  }

  // Hub Boss (Raised collar around the shaft for set screw)
  let finalGeometry: THREE.BufferGeometry = gearGeometry;
  if (hubHeight > 0 && hubDiameter > boreDiameter + 4) {
    const hubShape = new THREE.Shape();
    hubShape.absarc(0, 0, hubDiameter / 2, 0, Math.PI * 2, false);
    hubShape.holes.push(boreHole);

    const hubExtrude = new THREE.ExtrudeGeometry(hubShape, {
      steps: 1,
      depth: hubHeight,
      bevelEnabled: true,
      bevelThickness: 0.8,
      bevelSize: 0.8,
      bevelSegments: 2,
    });

    hubExtrude.translate(0, 0, faceWidth);

    // Merge geometries
    // We can rotate and align so face sits on the print bed (Z up becomes Y up)
    gearGeometry.rotateX(Math.PI / 2);
    hubExtrude.rotateX(Math.PI / 2);

    // Combine into single buffer geometry
    finalGeometry = mergeBufferGeometries([gearGeometry, hubExtrude]);
  } else {
    gearGeometry.rotateX(Math.PI / 2);
  }

  // Re-orient so base sits exactly flat at Y = 0 on print bed
  finalGeometry.center();
  finalGeometry.computeBoundingBox();
  if (finalGeometry.boundingBox) {
    finalGeometry.translate(0, -finalGeometry.boundingBox.min.y, 0);
  }

  finalGeometry.computeVertexNormals();
  return finalGeometry;
}

/**
 * Robust geometry merger utility without heavy dependencies
 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let indexOffset = 0;

  for (const geo of geometries) {
    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;
    const uv = geo.attributes.uv;
    const ind = geo.getIndex();

    if (!pos) continue;

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      if (uv) uvs.push(uv.getX(i), uv.getY(i));
    }

    if (ind) {
      for (let i = 0; i < ind.count; i++) {
        indices.push(ind.getX(i) + indexOffset);
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(i + indexOffset);
      }
    }

    indexOffset += pos.count;
  }

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length > 0) merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  if (uvs.length > 0) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);

  return merged;
}
