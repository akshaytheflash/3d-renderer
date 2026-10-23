import React from 'react';
import {
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ConfiguratorState } from '../../types/configurator';
import { sound } from '../../core/audio/synthAudio';

interface TopNavigationBarProps {
  state: ConfiguratorState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleAudio: () => void;
  onOpenTechStackModal: () => void;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  state,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleAudio,
  onOpenTechStackModal,
}) => {
  return (
    <header className="h-12 w-full bg-[#0a0d12]/95 border-b border-[#232b38] backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none shadow-md">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#00f0ff]/10 border border-[#00f0ff]/60 flex items-center justify-center text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-[#e1e7ec]">
                KINETIC FORGE <span className="text-[#00f0ff]">3D</span>
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#1b2330] text-[#00f0ff] px-1.5 py-0.2 rounded border border-[#232b38]">
                v2.4 CAD
              </span>
            </div>
            <span className="text-[10px] text-[#6b7b8e] font-sans -mt-0.5 hidden sm:inline">
              Procedural Geometry Synthesizer & Additive Slicer
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Quick Actions & Undo/Redo */}
      <div className="flex items-center gap-2 bg-[#12161f]/80 p-1 rounded-sm border border-[#232b38]">
        <button
          onClick={() => {
            onUndo();
            sound.playClick(380);
          }}
          disabled={!canUndo}
          className={`px-2 py-1 rounded-sm text-xs font-mono flex items-center gap-1 transition-colors ${
            canUndo
              ? 'text-[#e1e7ec] hover:text-[#00f0ff] hover:bg-[#1b2330]'
              : 'text-[#3b4758] cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">UNDO</span>
        </button>

        <div className="w-[1px] h-3 bg-[#232b38]"></div>

        <button
          onClick={() => {
            onRedo();
            sound.playClick(440);
          }}
          disabled={!canRedo}
          className={`px-2 py-1 rounded-sm text-xs font-mono flex items-center gap-1 transition-colors ${
            canRedo
              ? 'text-[#e1e7ec] hover:text-[#00f0ff] hover:bg-[#1b2330]'
              : 'text-[#3b4758] cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">REDO</span>
        </button>
      </div>

      {/* Right: Audio toggle, Tech Stack & Portfolio Specs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onToggleAudio();
            sound.playClick(500);
          }}
          className={`p-2 rounded-sm border transition-colors ${
            state.audioEnabled
              ? 'bg-[#12161f] border-[#232b38] text-[#00f0ff] hover:border-[#00f0ff]/50'
              : 'bg-[#12161f] border-[#232b38] text-[#6b7b8e] hover:text-[#e1e7ec]'
          }`}
          title={state.audioEnabled ? 'Mute Web Audio' : 'Enable Web Audio Synthesizer'}
        >
          {state.audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onOpenTechStackModal}
          className="px-2.5 py-1.5 bg-[#12161f] hover:bg-[#1b2330] border border-[#232b38] hover:border-[#00f0ff]/60 text-[#00f0ff] rounded-sm font-mono text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Code2 className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="hidden md:inline">SYSTEM ARCHITECTURE</span>
          <span className="md:hidden">SPECS</span>
        </button>
      </div>
    </header>
  );
};
