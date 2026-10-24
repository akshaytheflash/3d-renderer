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
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { ConfiguratorState } from '../../types/configurator';
import { sound } from '../../core/audio/synthAudio';

export type ActiveAppView = 'generator' | 'viewer';

interface TopNavigationBarProps {
  state: ConfiguratorState;
  activeView: ActiveAppView;
  onSelectView: (view: ActiveAppView) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleAudio: () => void;
  onOpenTechStackModal: () => void;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  state,
  activeView,
  onSelectView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleAudio,
  onOpenTechStackModal,
}) => {
  return (
    <header className="h-12 w-full bg-slate-950/95 border-b border-white/10 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none shadow-md">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-xs tracking-wide text-white">
                Kinetic Forge <span className="text-cyan-400">3D</span>
              </span>
              <span className="text-[10px] font-sans font-medium bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-white/5">
                CAD Studio
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher: Procedural Generator vs Online STL Viewer */}
        <div className="flex items-center bg-slate-900 border border-white/10 p-0.5 rounded-md ml-2">
          <button
            onClick={() => {
              onSelectView('generator');
              sound.playClick(500);
            }}
            className={`px-3 py-1 rounded text-xs font-sans font-medium flex items-center gap-1.5 transition-colors ${
              activeView === 'generator'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Procedural Generator</span>
          </button>

          <button
            onClick={() => {
              onSelectView('viewer');
              sound.playClick(500);
            }}
            className={`px-3 py-1 rounded text-xs font-sans font-medium flex items-center gap-1.5 transition-colors ${
              activeView === 'viewer'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Online STL Viewer</span>
          </button>
        </div>
      </div>

      {/* Center: Global Undo / Redo for procedural tweaks */}
      {activeView === 'generator' && (
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-white/5">
          <button
            onClick={() => {
              onUndo();
              sound.playClick(380);
            }}
            disabled={!canUndo}
            className={`px-2 py-0.5 rounded text-xs font-sans flex items-center gap-1 transition-colors ${
              canUndo
                ? 'text-slate-200 hover:text-cyan-400 hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo parameter tweak (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <div className="w-[1px] h-3 bg-white/10"></div>

          <button
            onClick={() => {
              onRedo();
              sound.playClick(440);
            }}
            disabled={!canRedo}
            className={`px-2 py-0.5 rounded text-xs font-sans flex items-center gap-1 transition-colors ${
              canRedo
                ? 'text-slate-200 hover:text-cyan-400 hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo parameter tweak (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
        </div>
      )}

      {/* Right Controls: Audio & Tech Specs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onToggleAudio();
            sound.playClick(500);
          }}
          className={`p-1.5 rounded border transition-colors ${
            state.audioEnabled
              ? 'bg-slate-900 border-white/10 text-cyan-400 hover:border-cyan-400/50'
              : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'
          }`}
          title={state.audioEnabled ? 'Mute Interface Sound' : 'Enable Web Audio Synth'}
        >
          {state.audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onOpenTechStackModal}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/40 text-cyan-400 rounded text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">System Specs</span>
          <span className="md:hidden">Specs</span>
        </button>
      </div>
    </header>
  );
};
