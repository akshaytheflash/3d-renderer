import { FilamentType, FILAMENT_PROFILES } from '../../types/configurator';

export interface PrintEstimate {
  filamentMassGrams: number;
  printTimeMinutes: number;
  estimatedCostUsd: number;
  totalLayers: number;
  perimetersVolumeCm3: number;
  infillVolumeCm3: number;
}

/**
 * Calculates realistic 3D print metrics:
 * - Real filament mass accounting for shell walls + sparse internal infill
 * - Print duration based on FDM kinematic deposition rate
 * - Material cost based on market spool prices
 */
export function estimatePrintCostAndTime(
  volumeCm3: number,
  surfaceAreaCm2: number,
  heightMm: number,
  filamentType: FilamentType,
  infillPercent: number, // 0 to 100
  layerHeightMm: number = 0.2
): PrintEstimate {
  const profile = FILAMENT_PROFILES[filamentType] || FILAMENT_PROFILES.pla;

  if (volumeCm3 <= 0 || heightMm <= 0) {
    return {
      filamentMassGrams: 0,
      printTimeMinutes: 0,
      estimatedCostUsd: 0,
      totalLayers: 0,
      perimetersVolumeCm3: 0,
      infillVolumeCm3: 0,
    };
  }

  // Shell perimeter simulation (typical 3 perimeters = 1.2mm wall thickness)
  // Perimeter volume approx = surfaceArea * shellThickness
  const shellThicknessCm = 0.12; // 1.2 mm
  const theoreticalShellVol = surfaceAreaCm2 * shellThicknessCm;
  const perimetersVolumeCm3 = Math.min(volumeCm3, theoreticalShellVol);
  const coreVolumeCm3 = Math.max(0, volumeCm3 - perimetersVolumeCm3);

  // Infill volume based on user infill %
  const infillFactor = Math.max(0, Math.min(100, infillPercent)) / 100.0;
  const infillVolumeCm3 = coreVolumeCm3 * infillFactor;

  // Total deposited plastic volume
  const actualPlasticVolumeCm3 = perimetersVolumeCm3 + infillVolumeCm3;

  // Mass (grams) = Volume (cm³) * Density (g/cm³)
  const massGrams = actualPlasticVolumeCm3 * profile.density;

  // Cost ($) = (Mass in kg) * ($/kg)
  const costUsd = (massGrams / 1000.0) * profile.costPerKg;

  // Layer count = Height / Layer Height
  const effectiveLayerH = layerHeightMm > 0 ? layerHeightMm : profile.defaultLayerHeight;
  const totalLayers = Math.max(1, Math.round(heightMm / effectiveLayerH));

  // Print speed estimation:
  // Modern coreXY (Bambu / Voron) deposits ~15-20 mm³/s, bedslingers (Prusa) ~10-12 mm³/s
  // Plus layer change overhead, heat up, bed leveling (~5 minutes base)
  const avgDepositionRateMm3PerSec = filamentType === 'resin' ? 8.0 : 12.0;
  const totalVolMm3 = actualPlasticVolumeCm3 * 1000.0;
  const extrusionSeconds = totalVolMm3 / avgDepositionRateMm3PerSec;
  const prepSeconds = 300; // 5 min setup
  const totalMinutes = Math.round((extrusionSeconds + prepSeconds) / 60);

  return {
    filamentMassGrams: parseFloat(massGrams.toFixed(1)),
    printTimeMinutes: totalMinutes,
    estimatedCostUsd: parseFloat(costUsd.toFixed(2)),
    totalLayers,
    perimetersVolumeCm3: parseFloat(perimetersVolumeCm3.toFixed(2)),
    infillVolumeCm3: parseFloat(infillVolumeCm3.toFixed(2)),
  };
}
