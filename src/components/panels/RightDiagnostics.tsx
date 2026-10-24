import React, { useState } from 'react';
import {
  Printer,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Scissors,
  Layers,
  Scale,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Download,
  Camera,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ConfiguratorState,
  GeometryMetrics,
  FilamentType,
  FILAMENT_PROFILES,
} from '../../types/configurator';
import { PrintEstimate } from '../../core/analyzers/printEstimator';
import { ParameterControl } from '../controls/ParameterControl';
import { sound } from '../../core/audio/synthAudio';

interface RightDiagnosticsProps {
  state: ConfiguratorState;
  metrics: GeometryMetrics;
  estimate: PrintEstimate;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAutoRepairTopology: () => void;
  onChange: (updater: (prev: ConfiguratorState) => ConfiguratorState) => void;
  onOpenExportModal: () => void;
  onQuickExportStl: () => void;
  onQuickExportObj: () => void;
  onQuickSnapshot: () => void;
}

export const RightDiagnostics: React.FC<RightDiagnosticsProps> = ({
  state,
  metrics,
  estimate,
  isCollapsed,
  onToggleCollapse,
  onAutoRepairTopology,
  onChange,
  onOpenExportModal,
  onQuickExportStl,
  onQuickExportObj,
  onQuickSnapshot,
}) => {
  const [sections, setSections] = useState({
    health: true,
    metrics: true,
    overhang: false,
    clipping: false,
    slicer: false,
  });

  const toggle = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    sound.playClick(440);
  };

  const updateState = (key: keyof ConfiguratorState, val: any) => {
    onChange((prev) => ({ ...prev, [key]: val }));
  };

  const hours = Math.floor(estimate.printTimeMinutes / 60);
  const minutes = estimate.printTimeMinutes % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  if (isCollapsed) {
    return (
      <div className="h-full bg-slate-900/90 border-l border-white/10 backdrop-blur-xl flex flex-col items-center py-3 px-1.5 z-20">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Expand Diagnostics Panel"
        >
          <PanelRightOpen className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-96 lg:w-[380px] h-full flex flex-col bg-slate-900/95 border-l border-white/10 backdrop-blur-xl z-20 select-none overflow-hidden shadow-2xl transition-all">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-cyan-400" />
          <h2 className="font-sans font-semibold text-xs tracking-wide text-white">
            Printability & Diagnostics
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium flex items-center gap-1 ${
              metrics.isWatertight
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {metrics.isWatertight ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {metrics.isWatertight ? 'Watertight' : 'Non-Manifold'}
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Collapse Panel"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accordions Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {/* CARD 1: TOPOLOGY HEALTH & ACTIONABLE AUTO-REPAIR */}
        <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('health')}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mesh Topology & Manifold Health</span>
            </span>
            {sections.health ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.health && (
            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5">
              <div className="flex items-start gap-2 pt-1">
                {metrics.isWatertight ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="text-xs font-sans font-semibold text-white">
                    {metrics.diagnosticSummary}
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 leading-snug">
                    {metrics.diagnosticSuggestion}
                  </p>
                </div>
              </div>

              {!metrics.isWatertight && (
                <button
                  type="button"
                  onClick={() => {
                    onAutoRepairTopology();
                    sound.playExportSuccess();
                  }}
                  className="w-full py-2 px-3 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Auto-Repair & Seal Topology
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-slate-400 bg-slate-900/50 p-2 rounded border border-white/5">
                <div>Facets: <span className="font-mono text-slate-200 font-semibold">{metrics.faceCount.toLocaleString()}</span></div>
                <div>Vertices: <span className="font-mono text-slate-200 font-semibold">{metrics.vertexCount.toLocaleString()}</span></div>
                <div>Open Edges: <span className="font-mono text-slate-200 font-semibold">{metrics.boundaryEdgeCount}</span></div>
                <div>T-Junctions: <span className="font-mono text-slate-200 font-semibold">{metrics.nonManifoldEdgeCount}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: PHYSICAL PRINT METRICS */}
        <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('metrics')}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Physical Deposition & Material Cost</span>
            </span>
            {sections.metrics ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.metrics && (
            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex flex-col">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-cyan-400" /> Filament Mass
                  </span>
                  <span className="text-sm font-semibold font-mono text-white mt-0.5">
                    {estimate.filamentMassGrams} <span className="text-[11px] text-slate-500 font-normal">g</span>
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex flex-col">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> Print Time
                  </span>
                  <span className="text-sm font-semibold font-mono text-white mt-0.5">
                    {timeFormatted}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex flex-col">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Material Cost
                  </span>
                  <span className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
                    ${estimate.estimatedCostUsd.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex flex-col">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" /> Total Layers
                  </span>
                  <span className="text-sm font-semibold font-mono text-white mt-0.5">
                    {estimate.totalLayers} <span className="text-[10px] text-slate-500 font-normal">@ {state.layerHeight}mm</span>
                  </span>
                </div>
              </div>

              {/* Polymer & Infill Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Polymer Spool</label>
                  <select
                    value={state.selectedFilament}
                    onChange={(e) => {
                      updateState('selectedFilament', e.target.value as FilamentType);
                      sound.playClick(500);
                    }}
                    className="w-full bg-slate-900 border border-white/10 text-cyan-400 text-xs font-sans rounded p-1.5 focus:outline-none"
                  >
                    {(Object.keys(FILAMENT_PROFILES) as FilamentType[]).map((ft) => (
                      <option key={ft} value={ft}>
                        {FILAMENT_PROFILES[ft].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Infill Density</label>
                  <select
                    value={state.infillPercent}
                    onChange={(e) => {
                      updateState('infillPercent', parseInt(e.target.value));
                      sound.playClick(500);
                    }}
                    className="w-full bg-slate-900 border border-white/10 text-cyan-400 text-xs font-sans rounded p-1.5 focus:outline-none"
                  >
                    <option value={10}>10% (Lightning)</option>
                    <option value={20}>20% (Standard)</option>
                    <option value={40}>40% (Structural)</option>
                    <option value={100}>100% (Solid)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: OVERHANG ANGLE ANALYZER */}
        <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('overhang')}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Overhang Angle Analyzer</span>
            </span>
            {sections.overhang ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.overhang && (
            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between py-1 text-xs font-sans">
                <span className="text-slate-300">Diagnostic Heatmap</span>
                <button
                  onClick={() => {
                    const next = state.materialMode === 'overhang' ? 'studio' : 'overhang';
                    updateState('materialMode', next);
                    sound.playClick(next === 'overhang' ? 680 : 440);
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    state.materialMode === 'overhang'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.materialMode === 'overhang' ? 'Heatmap Active' : 'Enable Heatmap'}
                </button>
              </div>

              <ParameterControl
                label="Overhang Threshold Angle"
                value={state.overhangThreshold}
                defaultValue={45}
                min={30}
                max={70}
                step={5}
                unit="°"
                description="Faces with steeper slope require support material on FDM printers"
                onChange={(v) => updateState('overhangThreshold', v)}
              />

              <div className="flex items-center justify-between text-xs font-sans pt-1">
                <span className="text-slate-400">Support Warning Area:</span>
                <span
                  className={`font-mono font-semibold ${
                    metrics.overhangWarningAreaPercentage > 15
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {metrics.overhangWarningAreaPercentage}% of Surface
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CARD 4: CROSS-SECTION CLIPPING */}
        <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('clipping')}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cross-Section Clipping Plane</span>
            </span>
            {sections.clipping ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.clipping && (
            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between py-1 text-xs font-sans">
                <span className="text-slate-300">Clipping Cut</span>
                <button
                  onClick={() => {
                    updateState('clippingEnabled', !state.clippingEnabled);
                    sound.playClick(600);
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    state.clippingEnabled
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.clippingEnabled ? 'Clipping Active' : 'Disabled'}
                </button>
              </div>

              {state.clippingEnabled && (
                <>
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-400">Cut Direction:</span>
                    <div className="flex items-center gap-1 font-sans">
                      {(['y', 'x', 'z'] as const).map((axis) => (
                        <button
                          key={axis}
                          onClick={() => {
                            updateState('clippingPlane', axis);
                            sound.playClick(520);
                          }}
                          className={`px-3 py-0.5 rounded uppercase text-xs font-medium transition-colors ${
                            state.clippingPlane === axis
                              ? 'bg-cyan-500 text-slate-950 font-semibold'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {axis}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ParameterControl
                    label="Section Position"
                    value={Math.round(state.clippingOffset * 100)}
                    defaultValue={50}
                    min={0}
                    max={100}
                    step={2}
                    unit="%"
                    onChange={(v) => updateState('clippingOffset', v / 100)}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* CARD 5: SLICER LAYER PREVIEW */}
        <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('slicer')}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Slicer Layer Toolpath Simulation</span>
            </span>
            {sections.slicer ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.slicer && (
            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between py-1 text-xs font-sans">
                <span className="text-slate-300">Layer Contours</span>
                <button
                  onClick={() => {
                    updateState('slicerActive', !state.slicerActive);
                    sound.playClick(state.slicerActive ? 400 : 700);
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    state.slicerActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.slicerActive ? 'Slicing Active' : 'Simulate Slicing'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-400">Layer Height:</span>
                <select
                  value={state.layerHeight}
                  onChange={(e) => {
                    updateState('layerHeight', parseFloat(e.target.value));
                    sound.playClick(500);
                  }}
                  className="bg-slate-900 border border-white/10 text-cyan-400 text-xs font-sans rounded p-1.5 focus:outline-none"
                >
                  <option value={0.12}>0.12 mm (Super Fine)</option>
                  <option value={0.20}>0.20 mm (Standard 0.4 Nozzle)</option>
                  <option value={0.28}>0.28 mm (Rapid Draft)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS DECK */}
      <div className="p-4 border-t border-white/5 bg-slate-950/70 flex flex-col gap-2">
        <button
          onClick={onQuickExportStl}
          className="w-full py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded font-sans font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Export Binary STL (Print Ready)
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onQuickExportObj}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-sans text-xs font-medium border border-white/5 transition-colors"
          >
            OBJ Mesh
          </button>
          <button
            onClick={onQuickSnapshot}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-sans text-xs font-medium border border-white/5 transition-colors flex items-center justify-center gap-1"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            Snapshot
          </button>
          <button
            onClick={onOpenExportModal}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded font-sans text-xs font-medium border border-white/5 transition-colors"
          >
            Options...
          </button>
        </div>
      </div>
    </div>
  );
};
