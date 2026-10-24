import React from 'react';
import { Palette, Box, Grid, Eye, Check } from 'lucide-react';
import { ConfiguratorState, MaterialMode, BedType, BED_PRESETS } from '../../types/configurator';
import { sound } from '../../core/audio/synthAudio';

interface BottomShaderDeckProps {
  state: ConfiguratorState;
  onChange: (updater: (prev: ConfiguratorState) => ConfiguratorState) => void;
}

export const BottomShaderDeck: React.FC<BottomShaderDeckProps> = ({ state, onChange }) => {
  const materials: { id: MaterialMode; label: string }[] = [
    { id: 'studio', label: 'Studio PBR' },
    { id: 'titanium', label: 'Titanium' },
    { id: 'clay', label: 'Matte Clay' },
    { id: 'resin', label: 'SLA Resin' },
    { id: 'overhang', label: 'Overhang Heatmap' },
    { id: 'wireframe', label: 'Wireframe' },
  ];

  const colorSwatches = [
    { name: 'Cyan', hex: '#00f0ff' },
    { name: 'Cadmium Orange', hex: '#ff8400' },
    { name: 'Stealth Gray', hex: '#94a3b8' },
    { name: 'Acid Lime', hex: '#a3e635' },
    { name: 'Hyper Magenta', hex: '#ec4899' },
    { name: 'Crimson', hex: '#f43f5e' },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20 flex flex-col md:flex-row items-center gap-2 bg-slate-900/90 border border-white/10 backdrop-blur-xl p-1.5 rounded-lg shadow-2xl select-none max-w-[95vw] overflow-x-auto">
      {/* Material Mode Selectors */}
      <div className="flex items-center gap-1">
        {materials.map((m) => {
          const isActive = state.materialMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                onChange((prev) => ({ ...prev, materialMode: m.id }));
                sound.playClick(isActive ? 440 : 560);
              }}
              className={`px-3 py-1 text-xs font-sans rounded font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-4 bg-white/10 hidden md:block"></div>

      {/* Color Swatches */}
      {state.materialMode !== 'clay' && state.materialMode !== 'overhang' && (
        <div className="flex items-center gap-1.5 px-1">
          {colorSwatches.map((swatch) => (
            <button
              key={swatch.hex}
              onClick={() => {
                onChange((prev) => ({ ...prev, materialColor: swatch.hex }));
                sound.playClick(620);
              }}
              style={{ backgroundColor: swatch.hex }}
              className={`w-4 h-4 rounded-full transition-transform flex items-center justify-center ${
                state.materialColor === swatch.hex
                  ? 'scale-125 ring-2 ring-white shadow'
                  : 'hover:scale-110 opacity-75 hover:opacity-100'
              }`}
              title={swatch.name}
            >
              {state.materialColor === swatch.hex && (
                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="w-[1px] h-4 bg-white/10 hidden md:block"></div>

      {/* Bed Preset & Viewport Helpers */}
      <div className="flex items-center gap-2">
        <select
          value={state.selectedBed}
          onChange={(e) => {
            onChange((prev) => ({ ...prev, selectedBed: e.target.value as BedType }));
            sound.playClick(480);
          }}
          className="bg-slate-950 border border-white/10 text-slate-300 hover:text-cyan-400 font-sans text-xs rounded px-2 py-1 focus:outline-none"
        >
          {Object.entries(BED_PRESETS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name} ({val.x}×{val.y} mm)
            </option>
          ))}
        </select>

        {/* Wireframe toggle */}
        <button
          onClick={() => {
            onChange((prev) => ({ ...prev, wireframeOverlay: !prev.wireframeOverlay }));
            sound.playClick(500);
          }}
          className={`p-1.5 rounded border transition-colors ${
            state.wireframeOverlay
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Toggle Wireframe Overlay"
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        {/* Bed Grid toggle */}
        <button
          onClick={() => {
            onChange((prev) => ({ ...prev, showBedGrid: !prev.showBedGrid }));
            sound.playClick(500);
          }}
          className={`p-1.5 rounded border transition-colors ${
            state.showBedGrid
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Print Bed Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Bounding box toggle */}
        <button
          onClick={() => {
            onChange((prev) => ({ ...prev, showBoundingBox: !prev.showBoundingBox }));
            sound.playClick(500);
          }}
          className={`p-1.5 rounded border transition-colors ${
            state.showBoundingBox
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Toggle Bounding Dimensions Cage"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
