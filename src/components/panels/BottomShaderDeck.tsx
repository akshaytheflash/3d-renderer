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
    { id: 'studio', label: 'STUDIO PBR' },
    { id: 'titanium', label: 'ANODIZED TITANIUM' },
    { id: 'clay', label: 'SCULPT CLAY' },
    { id: 'resin', label: 'SLA RESIN' },
    { id: 'overhang', label: 'OVERHANG HEATMAP' },
    { id: 'wireframe', label: 'WIREFRAME' },
  ];

  const colorSwatches = [
    { name: 'Cyan', hex: '#00f0ff' },
    { name: 'Cadmium Orange', hex: '#ff8400' },
    { name: 'Stealth Ghost', hex: '#94a3b8' },
    { name: 'Acid Volt', hex: '#a3e635' },
    { name: 'Hyper Magenta', hex: '#ec4899' },
    { name: 'Signal Crimson', hex: '#f43f5e' },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20 flex flex-col md:flex-row items-center gap-2 bg-[#12161f]/90 border border-[#232b38] backdrop-blur-xl p-1.5 rounded-sm shadow-2xl select-none max-w-[95vw] overflow-x-auto">
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
              className={`px-2.5 py-1 text-[11px] font-mono rounded-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#00f0ff] text-[#0a0d12] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-[#8e9dae] hover:text-[#e1e7ec] hover:bg-[#1b2330]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-4 bg-[#232b38] hidden md:block"></div>

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
                  ? 'scale-125 ring-2 ring-white shadow-md'
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              title={swatch.name}
            >
              {state.materialColor === swatch.hex && (
                <Check className="w-2.5 h-2.5 text-[#0a0d12] stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="w-[1px] h-4 bg-[#232b38] hidden md:block"></div>

      {/* Bed Preset & Viewport Helpers */}
      <div className="flex items-center gap-2">
        {/* Bed Preset */}
        <select
          value={state.selectedBed}
          onChange={(e) => {
            onChange((prev) => ({ ...prev, selectedBed: e.target.value as BedType }));
            sound.playClick(480);
          }}
          className="bg-[#0a0d12] border border-[#232b38] text-[#8e9dae] hover:text-[#00f0ff] font-mono text-[11px] rounded-sm px-2 py-1 focus:outline-none"
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
          className={`p-1 rounded-sm border transition-colors ${
            state.wireframeOverlay
              ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
              : 'bg-[#0a0d12] text-[#8e9dae] border-[#232b38]'
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
          className={`p-1 rounded-sm border transition-colors ${
            state.showBedGrid
              ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
              : 'bg-[#0a0d12] text-[#8e9dae] border-[#232b38]'
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
          className={`p-1 rounded-sm border transition-colors ${
            state.showBoundingBox
              ? 'bg-[#ff8400]/20 text-[#ff8400] border-[#ff8400]/60'
              : 'bg-[#0a0d12] text-[#8e9dae] border-[#232b38]'
          }`}
          title="Toggle Bounding Dimensions Cage"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
