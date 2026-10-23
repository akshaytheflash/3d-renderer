import React from 'react';
import {
  ShieldAlert,
  Scissors,
  Layers,
  Printer,
  Download,
  DollarSign,
  Scale,
  Clock,
  Sparkles,
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
  onChange,
  onOpenExportModal,
  onQuickExportStl,
  onQuickExportObj,
  onQuickSnapshot,
}) => {
  const updateState = (key: keyof ConfiguratorState, val: any) => {
    onChange((prev) => ({ ...prev, [key]: val }));
  };

  const hours = Math.floor(estimate.printTimeMinutes / 60);
  const minutes = estimate.printTimeMinutes % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  return (
    <div className="w-80 md:w-96 h-full flex flex-col bg-[#12161f]/95 border-l border-[#232b38] backdrop-blur-xl z-20 select-none overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#232b38] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-[#00f0ff]" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#e1e7ec]">
            PRINTABILITY & SLICER HUD
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border font-semibold flex items-center gap-1 ${
            metrics.isWatertight
              ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30'
              : 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30'
          }`}
        >
          {metrics.isWatertight ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {metrics.isWatertight ? 'WATERTIGHT' : 'OPEN EDGES'}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PHYSICAL TELEMETRY CARD */}
        <div className="bg-[#0a0d12] border border-[#232b38] rounded-sm p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/60 font-semibold">
            <span>PHYSICAL DEPOSITION METRICS</span>
            <span className="text-[#00f0ff]">{state.selectedFilament.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#12161f] p-2 rounded-sm border border-[#232b38]/50 flex flex-col">
              <span className="text-[10px] text-[#8e9dae] flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#00f0ff]" /> FILAMENT MASS
              </span>
              <span className="text-sm font-bold text-[#e1e7ec] mt-0.5">
                {estimate.filamentMassGrams} <span className="text-xs text-[#8e9dae] font-normal">g</span>
              </span>
            </div>

            <div className="bg-[#12161f] p-2 rounded-sm border border-[#232b38]/50 flex flex-col">
              <span className="text-[10px] text-[#8e9dae] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00f0ff]" /> EST. PRINT TIME
              </span>
              <span className="text-sm font-bold text-[#e1e7ec] mt-0.5">
                {timeFormatted}
              </span>
            </div>

            <div className="bg-[#12161f] p-2 rounded-sm border border-[#232b38]/50 flex flex-col">
              <span className="text-[10px] text-[#8e9dae] flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#10b981]" /> MATERIAL COST
              </span>
              <span className="text-sm font-bold text-[#10b981] mt-0.5">
                ${estimate.estimatedCostUsd.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#12161f] p-2 rounded-sm border border-[#232b38]/50 flex flex-col">
              <span className="text-[10px] text-[#8e9dae] flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#ff8400]" /> TOTAL LAYERS
              </span>
              <span className="text-sm font-bold text-[#e1e7ec] mt-0.5">
                {estimate.totalLayers} <span className="text-[10px] text-[#8e9dae]">@ {state.layerHeight}mm</span>
              </span>
            </div>
          </div>

          {/* Filament Profile & Infill Selection */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <label className="text-[10px] font-mono text-[#8e9dae] block mb-1">POLYMER TYPE</label>
              <select
                value={state.selectedFilament}
                onChange={(e) => {
                  updateState('selectedFilament', e.target.value as FilamentType);
                  sound.playClick(500);
                }}
                className="w-full bg-[#12161f] border border-[#232b38] text-[#00f0ff] font-mono text-xs rounded-sm p-1.5 focus:outline-none"
              >
                {(Object.keys(FILAMENT_PROFILES) as FilamentType[]).map((ft) => (
                  <option key={ft} value={ft}>
                    {FILAMENT_PROFILES[ft].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8e9dae] block mb-1">INFILL DENSITY</label>
              <select
                value={state.infillPercent}
                onChange={(e) => {
                  updateState('infillPercent', parseInt(e.target.value));
                  sound.playClick(500);
                }}
                className="w-full bg-[#12161f] border border-[#232b38] text-[#00f0ff] font-mono text-xs rounded-sm p-1.5 focus:outline-none"
              >
                <option value={10}>10% (Lightning / Fast)</option>
                <option value={20}>20% (Standard Optimal)</option>
                <option value={40}>40% (Structural Dense)</option>
                <option value={100}>100% (Solid Infill)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3D PRINTABILITY OVERHANG DIAGNOSTICS */}
        <div className="bg-[#0a0d12] border border-[#232b38] rounded-sm p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/60 font-semibold">
            <span className="flex items-center gap-1.5 text-[#ff8400]">
              <ShieldAlert className="w-3.5 h-3.5" /> OVERHANG SLOPE ANALYZER
            </span>
            <button
              onClick={() => {
                const next = state.materialMode === 'overhang' ? 'studio' : 'overhang';
                updateState('materialMode', next);
                sound.playClick(next === 'overhang' ? 680 : 440);
              }}
              className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border transition-colors ${
                state.materialMode === 'overhang'
                  ? 'bg-[#ff8400]/20 text-[#ff8400] border-[#ff8400]/60'
                  : 'bg-[#12161f] text-[#8e9dae] border-[#232b38]'
              }`}
            >
              {state.materialMode === 'overhang' ? 'HEATMAP ON' : 'VIEW HEATMAP'}
            </button>
          </div>

          <ParameterControl
            label="Overhang Warning Angle"
            value={state.overhangThreshold}
            min={30}
            max={70}
            step={5}
            unit="°"
            description="Faces steeper than this angle relative to bed will require support"
            onChange={(v) => updateState('overhangThreshold', v)}
          />

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-[#8e9dae]">Support Warning Surface:</span>
            <span
              className={`font-bold ${
                metrics.overhangWarningAreaPercentage > 15
                  ? 'text-[#ef4444]'
                  : metrics.overhangWarningAreaPercentage > 0
                  ? 'text-[#f59e0b]'
                  : 'text-[#10b981]'
              }`}
            >
              {metrics.overhangWarningAreaPercentage}% of Area
            </span>
          </div>
        </div>

        {/* CROSS-SECTION CLIPPING TOOL */}
        <div className="bg-[#0a0d12] border border-[#232b38] rounded-sm p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/60 font-semibold">
            <span className="flex items-center gap-1.5 text-[#00f0ff]">
              <Scissors className="w-3.5 h-3.5" /> CROSS-SECTION SLICING PLANE
            </span>
            <button
              onClick={() => {
                updateState('clippingEnabled', !state.clippingEnabled);
                sound.playClick(600);
              }}
              className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border transition-colors ${
                state.clippingEnabled
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
                  : 'bg-[#12161f] text-[#8e9dae] border-[#232b38]'
              }`}
            >
              {state.clippingEnabled ? 'CLIPPING ACTIVE' : 'DISABLED'}
            </button>
          </div>

          {state.clippingEnabled && (
            <div className="space-y-2 pt-1 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e9dae] font-mono">Cut Axis:</span>
                <div className="flex items-center gap-1 font-mono">
                  {(['y', 'x', 'z'] as const).map((axis) => (
                    <button
                      key={axis}
                      onClick={() => {
                        updateState('clippingPlane', axis);
                        sound.playClick(520);
                      }}
                      className={`px-2.5 py-0.5 rounded-sm uppercase text-xs font-bold border transition-colors ${
                        state.clippingPlane === axis
                          ? 'bg-[#00f0ff] text-[#0a0d12] border-[#00f0ff]'
                          : 'bg-[#12161f] text-[#8e9dae] border-[#232b38]'
                      }`}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>

              <ParameterControl
                label="Section Depth"
                value={Math.round(state.clippingOffset * 100)}
                min={0}
                max={100}
                step={2}
                unit="%"
                onChange={(v) => updateState('clippingOffset', v / 100)}
              />
            </div>
          )}
        </div>

        {/* SLICER TOOLPATH VISUALIZER */}
        <div className="bg-[#0a0d12] border border-[#232b38] rounded-sm p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/60 font-semibold">
            <span className="flex items-center gap-1.5 text-[#00f0ff]">
              <Layers className="w-3.5 h-3.5" /> G-CODE LAYER SIMULATOR
            </span>
            <button
              onClick={() => {
                updateState('slicerActive', !state.slicerActive);
                sound.playClick(state.slicerActive ? 400 : 700);
              }}
              className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border transition-colors ${
                state.slicerActive
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
                  : 'bg-[#12161f] text-[#8e9dae] border-[#232b38]'
              }`}
            >
              {state.slicerActive ? 'PREVIEW ON' : 'SIMULATE SLICE'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8e9dae]">Layer Height:</span>
            <select
              value={state.layerHeight}
              onChange={(e) => {
                updateState('layerHeight', parseFloat(e.target.value));
                sound.playClick(500);
              }}
              className="bg-[#12161f] border border-[#232b38] text-[#00f0ff] font-mono text-xs rounded-sm p-1 focus:outline-none"
            >
              <option value={0.12}>0.12 mm (Super Fine)</option>
              <option value={0.20}>0.20 mm (Standard 0.4 nozzle)</option>
              <option value={0.28}>0.28 mm (Rapid Draft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* FOOTER EXPORT DECK */}
      <div className="p-3.5 border-t border-[#232b38] bg-[#0a0d12] flex flex-col gap-2">
        <button
          onClick={onQuickExportStl}
          className="w-full py-2.5 px-3 bg-[#00f0ff] hover:bg-[#38bdf8] text-[#0a0d12] rounded-sm font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00f0ff]/20 hover:shadow-[#00f0ff]/40 transition-all active:scale-[0.99]"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          EXPORT BINARY STL (PRINT READY)
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onQuickExportObj}
            className="py-1.5 px-2 bg-[#12161f] hover:bg-[#1b2330] border border-[#232b38] hover:border-[#00f0ff]/50 text-[#e1e7ec] rounded-sm font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            OBJ MESH
          </button>
          <button
            onClick={onQuickSnapshot}
            className="py-1.5 px-2 bg-[#12161f] hover:bg-[#1b2330] border border-[#232b38] hover:border-[#00f0ff]/50 text-[#e1e7ec] rounded-sm font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            SNAPSHOT
          </button>
          <button
            onClick={onOpenExportModal}
            className="py-1.5 px-2 bg-[#12161f] hover:bg-[#1b2330] border border-[#232b38] hover:border-[#00f0ff]/50 text-[#00f0ff] rounded-sm font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            OPTIONS...
          </button>
        </div>
      </div>
    </div>
  );
};
