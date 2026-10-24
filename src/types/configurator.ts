export type GeneratorType = 'vase' | 'gyroid' | 'gear' | 'sculpture' | 'lantern';

export type MaterialMode = 'studio' | 'clay' | 'titanium' | 'resin' | 'overhang' | 'wireframe';

export type BedType = 'bambu-x1c' | 'prusa-mk4' | 'voron-350' | 'custom';

export interface BedDimensions {
  name: string;
  x: number; // mm
  y: number; // mm
  z: number; // mm
}

export const BED_PRESETS: Record<BedType, BedDimensions> = {
  'bambu-x1c': { name: 'Bambu Lab X1-Carbon / P1S', x: 256, y: 256, z: 256 },
  'prusa-mk4': { name: 'Prusa MK4 / MK3S+', x: 250, y: 210, z: 220 },
  'voron-350': { name: 'Voron 2.4 (350mm)', x: 350, y: 350, z: 350 },
  'custom': { name: 'Custom Envelope', x: 200, y: 200, z: 200 },
};

export type FilamentType = 'pla' | 'petg' | 'abs' | 'resin' | 'tpu';

export interface FilamentSpecs {
  name: string;
  density: number; // g/cm³
  costPerKg: number; // USD
  defaultLayerHeight: number; // mm
}

export const FILAMENT_PROFILES: Record<FilamentType, FilamentSpecs> = {
  pla: { name: 'PLA (Polylactic Acid)', density: 1.24, costPerKg: 22, defaultLayerHeight: 0.2 },
  petg: { name: 'PETG (Polyethylene Terephthalate)', density: 1.27, costPerKg: 25, defaultLayerHeight: 0.2 },
  abs: { name: 'ABS / ASA', density: 1.04, costPerKg: 24, defaultLayerHeight: 0.2 },
  resin: { name: 'Standard UV Resin (SLA)', density: 1.12, costPerKg: 35, defaultLayerHeight: 0.05 },
  tpu: { name: 'TPU Flexible (95A)', density: 1.21, costPerKg: 32, defaultLayerHeight: 0.2 },
};

// Parameters for each procedural geometry engine
export interface VaseParams {
  height: number;
  baseRadius: number;
  waistRadius: number;
  rimRadius: number;
  waistPosition: number; // 0 to 1
  fluteCount: number; // radial lobes
  fluteDepth: number; // amplitude
  twist: number; // spiral angle in radians
  waveFrequency: number; // vertical waves
  waveAmplitude: number;
  wallThickness: number; // for hollow 3D print
  isHollow: boolean;
  resolutionRadial: number;
  resolutionHeight: number;
}

export interface GyroidParams {
  size: number;
  scale: number; // frequency of TPMS waves
  thickness: number; // shell thickness
  isovalue: number; // surface boundary
  resolution: number; // grid density
  morph: number; // parametric transformation
  latticeType: 'gyroid' | 'schwarz-p' | 'diamond';
  cageBoundary: boolean;
}

export interface GearParams {
  toothCount: number;
  module: number; // pitch diameter = toothCount * module
  pressureAngle: number; // degrees (usually 14.5 or 20)
  faceWidth: number; // thickness (Z)
  boreDiameter: number; // center shaft hole
  hubDiameter: number;
  hubHeight: number;
  hasKeyway: boolean;
  keywayWidth: number;
  keywayDepth: number;
  spokeCount: number; // 0 for solid, >2 for spoke cutouts
  rimThickness: number;
  helixAngle: number; // for helical gears
}

export interface SculptureParams {
  radius: number;
  tubeRadius: number;
  p: number; // torus knot loops around rotational axis
  q: number; // torus knot loops around interior axis
  tubularSegments: number;
  radialSegments: number;
  ribCount: number;
  ribDepth: number;
  twistFactor: number;
  sculptureShape: 'torus' | 'mobius' | 'spiral';
}

export interface LanternParams {
  height: number;
  radiusBottom: number;
  radiusTop: number;
  cellColumns: number;
  cellRows: number;
  apertureSize: number; // size of cellular cutouts
  wallThickness: number;
  twistAngle: number;
  capTop: boolean;
  innerCavity: boolean;
}

export interface ConfiguratorState {
  generatorType: GeneratorType;
  vase: VaseParams;
  gyroid: GyroidParams;
  gear: GearParams;
  sculpture: SculptureParams;
  lantern: LanternParams;

  // Viewport & Rendering Settings
  materialMode: MaterialMode;
  materialColor: string;
  wireframeOverlay: boolean;
  showBedGrid: boolean;
  selectedBed: BedType;
  showBoundingBox: boolean;

  // Diagnostics & Slicing
  clippingEnabled: boolean;
  clippingPlane: 'x' | 'y' | 'z';
  clippingOffset: number; // 0 to 1
  overhangThreshold: number; // degrees, default 45°
  
  // Slicer Preview
  slicerActive: boolean;
  slicerCurrentLayer: number; // 0 to totalLayers
  layerHeight: number; // mm
  infillPercent: number; // 0 to 100%
  selectedFilament: FilamentType;

  // Audio Feedback
  audioEnabled: boolean;
}

export interface GeometryMetrics {
  vertexCount: number;
  faceCount: number;
  volumeCm3: number;
  surfaceAreaCm2: number;
  isWatertight: boolean;
  boundaryEdgeCount: number;
  nonManifoldEdgeCount: number;
  diagnosticSummary: string;
  diagnosticSuggestion: string;
  boundingBox: {
    width: number; // mm
    depth: number; // mm
    height: number; // mm
  };
  printTimeMinutes: number;
  filamentMassGrams: number;
  estimatedCostUsd: number;
  overhangWarningAreaPercentage: number;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  generatorType: GeneratorType;
  params: any;
}
