import * as THREE from 'three';
import { MaterialMode } from '../../types/configurator';

/**
 * Creates dynamic high-fidelity Three.js materials based on user mode
 */
export function getMaterialForMode(
  mode: MaterialMode,
  baseColor: string = '#00f0ff',
  clippingPlanes: THREE.Plane[] = []
): THREE.Material {
  switch (mode) {
    case 'clay':
      // Industrial Matte Sculptor's Clay
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d4cec7'),
        roughness: 0.95,
        metalness: 0.05,
        flatShading: false,
        clippingPlanes,
        clipShadows: true,
      });

    case 'titanium':
      // Aerospace Anodized Titanium with subtle anisotropic luster
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(baseColor || '#4361ee'),
        metalness: 0.85,
        roughness: 0.25,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        reflectivity: 0.9,
        clippingPlanes,
        clipShadows: true,
      });

    case 'resin':
      // Frosted Translucent SLA 3D Printing Photopolymer Resin
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(baseColor || '#38bdf8'),
        transmission: 0.75,
        opacity: 1,
        transparent: true,
        roughness: 0.2,
        ior: 1.45,
        thickness: 12.0,
        specularIntensity: 1.0,
        clippingPlanes,
        clipShadows: true,
      });

    case 'wireframe':
      // Sharp CAD Vector Wireframe
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(baseColor || '#00f0ff'),
        wireframe: true,
        clippingPlanes,
      });

    case 'studio':
    default:
      // High-precision Studio PBR
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(baseColor || '#22d3ee'),
        metalness: 0.2,
        roughness: 0.35,
        clippingPlanes,
        clipShadows: true,
      });
  }
}
