import React, { useState, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  ConfiguratorState,
  GeometryMetrics,
  Preset,
} from './types/configurator';
import { useHistoryState } from './hooks/useHistoryState';
import { buildGeometry } from './core/generators/generatorRegistry';
import { calculateGeometryMetrics } from './core/analyzers/volumeCalculator';
import { estimatePrintCostAndTime } from './core/analyzers/printEstimator';
import { generateLayerSlices } from './core/analyzers/slicerSimulator';
import { exportBinarySTL, exportAsciiSTL, downloadFile } from './core/exporters/stlExporter';
import { exportOBJ } from './core/exporters/objExporter';
import { captureCanvasSnapshot } from './core/exporters/snapshot';
import { sound } from './core/audio/synthAudio';
import { BUILTIN_PRESETS } from './core/presets/presetsList';

// UI Components
import { TopNavigationBar } from './components/panels/TopNavigationBar';
import { LeftInspector } from './components/panels/LeftInspector';
import { RightDiagnostics } from './components/panels/RightDiagnostics';
import { BottomShaderDeck } from './components/panels/BottomShaderDeck';
import { ThreeCanvas } from './components/viewport/ThreeCanvas';
import { ViewportOverlay } from './components/viewport/ViewportOverlay';
import { ExportModal } from './components/modals/ExportModal';
import { TechStackModal } from './components/modals/TechStackModal';

const INITIAL_STATE: ConfiguratorState = {
  generatorType: 'vase',
  vase: { ...BUILTIN_PRESETS[0].params },
  gear: { ...BUILTIN_PRESETS[2].params },
  sculpture: { ...BUILTIN_PRESETS[4].params },
  gyroid: { ...BUILTIN_PRESETS[6].params },
  lantern: { ...BUILTIN_PRESETS[7].params },

  materialMode: 'studio',
  materialColor: '#00f0ff',
  wireframeOverlay: false,
  showBedGrid: true,
  selectedBed: 'bambu-x1c',
  showBoundingBox: true,

  clippingEnabled: false,
  clippingPlane: 'y',
  clippingOffset: 0.5,
  overhangThreshold: 45,

  slicerActive: false,
  slicerCurrentLayer: 0,
  layerHeight: 0.2,
  infillPercent: 20,
  selectedFilament: 'pla',

  audioEnabled: true,
};

export default function App() {
  const { state, setState, undo, redo, canUndo, canRedo } = useHistoryState(INITIAL_STATE);
  const [rendererInstance, setRendererInstance] = useState<THREE.WebGLRenderer | null>(null);

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);

  // Sync audio toggle with sound engine
  const handleToggleAudio = useCallback(() => {
    setState((prev) => {
      const next = !prev.audioEnabled;
      sound.setEnabled(next);
      return { ...prev, audioEnabled: next };
    });
  }, [setState]);

  // Build Procedural Geometry
  const geometry = useMemo(() => {
    try {
      return buildGeometry(state);
    } catch (e) {
      console.error('Geometry generation error:', e);
      return null;
    }
  }, [
    state.generatorType,
    state.vase,
    state.gear,
    state.sculpture,
    state.gyroid,
    state.lantern,
  ]);

  // Physical & Printability Metrics
  const metrics: GeometryMetrics = useMemo(() => {
    if (!geometry) {
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
    return calculateGeometryMetrics(geometry, state.overhangThreshold);
  }, [geometry, state.overhangThreshold]);

  // Realistic Print Cost & Slicing Estimate
  const printEstimate = useMemo(() => {
    return estimatePrintCostAndTime(
      metrics.volumeCm3,
      metrics.surfaceAreaCm2,
      metrics.boundingBox.height,
      state.selectedFilament,
      state.infillPercent,
      state.layerHeight
    );
  }, [
    metrics.volumeCm3,
    metrics.surfaceAreaCm2,
    metrics.boundingBox.height,
    state.selectedFilament,
    state.infillPercent,
    state.layerHeight,
  ]);

  // Live Slicing Simulation Toolpath Geometry
  const sliceGeometry = useMemo(() => {
    if (!state.slicerActive || !geometry) return null;
    return generateLayerSlices(geometry, state.layerHeight, 150);
  }, [state.slicerActive, geometry, state.layerHeight]);

  // Apply Preset
  const handleApplyPreset = useCallback((preset: Preset) => {
    setState((prev) => {
      const next = { ...prev, generatorType: preset.generatorType };
      switch (preset.generatorType) {
        case 'vase':
          next.vase = { ...preset.params };
          break;
        case 'gear':
          next.gear = { ...preset.params };
          break;
        case 'sculpture':
          next.sculpture = { ...preset.params };
          break;
        case 'gyroid':
          next.gyroid = { ...preset.params };
          break;
        case 'lantern':
          next.lantern = { ...preset.params };
          break;
      }
      return next;
    });
  }, [setState]);

  // Aesthetic Random Mutation
  const handleRandomize = useCallback(() => {
    setState((prev) => {
      const next = { ...prev };
      if (next.generatorType === 'vase') {
        next.vase = {
          ...next.vase,
          height: Math.round(90 + Math.random() * 110),
          baseRadius: Math.round(25 + Math.random() * 35),
          waistRadius: Math.round(15 + Math.random() * 30),
          rimRadius: Math.round(25 + Math.random() * 35),
          fluteCount: Math.floor(4 + Math.random() * 16),
          fluteDepth: parseFloat((2 + Math.random() * 8).toFixed(1)),
          twist: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
          waveAmplitude: parseFloat((Math.random() * 5).toFixed(1)),
        };
      } else if (next.generatorType === 'gear') {
        const tooth = Math.floor(14 + Math.random() * 30);
        next.gear = {
          ...next.gear,
          toothCount: tooth,
          module: parseFloat((2 + Math.random() * 3).toFixed(1)),
          helixAngle: Math.random() > 0.5 ? Math.round(Math.random() * 25) : 0,
          spokeCount: Math.random() > 0.4 ? Math.floor(3 + Math.random() * 4) : 0,
          faceWidth: Math.round(12 + Math.random() * 16),
        };
      } else if (next.generatorType === 'sculpture') {
        const pVals = [2, 3, 4, 5];
        const qVals = [3, 5, 7];
        next.sculpture = {
          ...next.sculpture,
          p: pVals[Math.floor(Math.random() * pVals.length)],
          q: qVals[Math.floor(Math.random() * qVals.length)],
          ribCount: Math.floor(3 + Math.random() * 8),
          ribDepth: parseFloat((0.8 + Math.random() * 2).toFixed(1)),
          twistFactor: parseFloat((1 + Math.random() * 5).toFixed(1)),
        };
      } else if (next.generatorType === 'lantern') {
        next.lantern = {
          ...next.lantern,
          height: Math.round(100 + Math.random() * 90),
          cellColumns: Math.floor(7 + Math.random() * 7),
          cellRows: Math.floor(5 + Math.random() * 6),
          twistAngle: parseFloat((Math.random() * 2).toFixed(2)),
          apertureSize: parseFloat((0.4 + Math.random() * 0.35).toFixed(2)),
        };
      }
      return next;
    });
  }, [setState]);

  // Import JSON Preset
  const handleImportJson = useCallback((imported: Partial<ConfiguratorState>) => {
    setState((prev) => ({ ...prev, ...imported }));
  }, [setState]);

  // Quick Export Actions
  const handleExportBinaryStl = useCallback(() => {
    if (!geometry) return;
    const blob = exportBinarySTL(geometry);
    downloadFile(blob, `kinetic-forge-${state.generatorType}-${Date.now()}.stl`);
    sound.playExportSuccess();
  }, [geometry, state.generatorType]);

  const handleExportAsciiStl = useCallback(() => {
    if (!geometry) return;
    const blob = exportAsciiSTL(geometry);
    downloadFile(blob, `kinetic-forge-${state.generatorType}-ascii.stl`);
    sound.playExportSuccess();
  }, [geometry, state.generatorType]);

  const handleExportObj = useCallback(() => {
    if (!geometry) return;
    const blob = exportOBJ(geometry, `KineticForge_${state.generatorType}`);
    downloadFile(blob, `kinetic-forge-${state.generatorType}-${Date.now()}.obj`);
    sound.playExportSuccess();
  }, [geometry, state.generatorType]);

  const handleExportSnapshot = useCallback(() => {
    if (!rendererInstance) return;
    captureCanvasSnapshot(rendererInstance, `kinetic-forge-${state.generatorType}-render.png`);
    sound.playExportSuccess();
  }, [rendererInstance, state.generatorType]);

  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `kinetic-forge-${state.generatorType}-preset.json`);
    dlAnchorElem.click();
    sound.playExportSuccess();
  }, [state]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#0a0d12] text-[#e1e7ec]">
      {/* Top Header Navigation */}
      <TopNavigationBar
        state={state}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onToggleAudio={handleToggleAudio}
        onOpenTechStackModal={() => setIsTechStackModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="relative flex-1 w-full h-[calc(100vh-48px)] flex overflow-hidden">
        {/* Left Morphogenesis Controls Bank */}
        <LeftInspector
          state={state}
          onChange={setState}
          onApplyPreset={handleApplyPreset}
          onRandomize={handleRandomize}
          onImportJson={handleImportJson}
        />

        {/* Center Interactive 3D Viewport */}
        <div className="relative flex-1 h-full overflow-hidden">
          <ThreeCanvas
            geometry={geometry}
            state={state}
            onRendererReady={setRendererInstance}
            sliceGeometry={sliceGeometry}
          />

          {/* Viewport Floating HUD & Quick Orientation Controls */}
          <ViewportOverlay
            metrics={metrics}
            isOverhangMode={state.materialMode === 'overhang'}
            isSlicerActive={state.slicerActive}
          />

          {/* Bottom Floating Material & Bed Deck */}
          <BottomShaderDeck state={state} onChange={setState} />
        </div>

        {/* Right Print Diagnostics & Slicing Panel */}
        <RightDiagnostics
          state={state}
          metrics={metrics}
          estimate={printEstimate}
          onChange={setState}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onQuickExportStl={handleExportBinaryStl}
          onQuickExportObj={handleExportObj}
          onQuickSnapshot={handleExportSnapshot}
        />
      </div>

      {/* Export Options Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={metrics}
        onExportBinaryStl={handleExportBinaryStl}
        onExportAsciiStl={handleExportAsciiStl}
        onExportObj={handleExportObj}
        onExportSnapshot={handleExportSnapshot}
        onExportJson={handleExportJson}
      />

      {/* Tech Stack & Job Application Portfolio Modal */}
      <TechStackModal
        isOpen={isTechStackModalOpen}
        onClose={() => setIsTechStackModalOpen(false)}
      />
    </div>
  );
}
