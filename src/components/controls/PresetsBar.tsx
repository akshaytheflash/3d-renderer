import React, { useState } from 'react';
import { Bookmark, Dices, Download, Upload, Trash2, Check } from 'lucide-react';
import { Preset, ConfiguratorState } from '../../types/configurator';
import { BUILTIN_PRESETS } from '../../core/presets/presetsList';
import { sound } from '../../core/audio/synthAudio';

interface PresetsBarProps {
  state: ConfiguratorState;
  onApplyPreset: (preset: Preset) => void;
  onRandomize: () => void;
  onImportJson: (imported: Partial<ConfiguratorState>) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  state,
  onApplyPreset,
  onRandomize,
  onImportJson,
}) => {
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem('kinetic_forge_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const matchingPresets = BUILTIN_PRESETS.filter((p) => p.generatorType === state.generatorType);
  const matchingCustom = customPresets.filter((p) => p.generatorType === state.generatorType);

  const handleSaveCustom = () => {
    if (!newPresetName.trim()) return;

    let params: any;
    switch (state.generatorType) {
      case 'vase':
        params = state.vase;
        break;
      case 'gear':
        params = state.gear;
        break;
      case 'sculpture':
        params = state.sculpture;
        break;
      case 'gyroid':
        params = state.gyroid;
        break;
      case 'lantern':
        params = state.lantern;
        break;
    }

    const newPreset: Preset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: `User defined preset for ${state.generatorType}`,
      generatorType: state.generatorType,
      params: { ...params },
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('kinetic_forge_custom_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewPresetName('');
    setShowSaveDialog(false);
    sound.playExportSuccess();
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('kinetic_forge_custom_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    sound.playClick(320);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `kinetic-forge-${state.generatorType}-preset.json`);
    dlAnchorElem.click();
    sound.playExportSuccess();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportJson(parsed);
        sound.playMorph();
      } catch {
        alert('Invalid JSON preset file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-slate-300 font-medium flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          Morphology Presets
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onRandomize();
              sound.playMorph();
            }}
            className="flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
            title="Randomize Parameters"
          >
            <Dices className="w-3 h-3 text-cyan-400" />
            Mutate
          </button>

          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
          >
            + Save
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="flex items-center gap-1.5 p-2 bg-slate-950 border border-cyan-500/40 rounded">
          <input
            type="text"
            placeholder="Preset Name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white flex-1 focus:border-cyan-400 focus:outline-none"
          />
          <button
            onClick={handleSaveCustom}
            className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Preset List */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
        {matchingPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              onApplyPreset(preset);
              sound.playMorph();
            }}
            className="text-left px-2.5 py-1.5 rounded bg-slate-950/60 border border-white/5 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-colors group flex-1 min-w-[130px]"
          >
            <div className="text-xs font-sans font-medium text-slate-200 group-hover:text-cyan-400 truncate">
              {preset.name}
            </div>
            <div className="text-[10px] text-slate-500 truncate font-sans">
              {preset.description}
            </div>
          </button>
        ))}

        {matchingCustom.map((preset) => (
          <div
            key={preset.id}
            onClick={() => {
              onApplyPreset(preset);
              sound.playMorph();
            }}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/60 transition-colors cursor-pointer group flex-1 min-w-[130px]"
          >
            <div className="truncate">
              <div className="text-xs font-sans font-medium text-cyan-400 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-sans">Custom</div>
            </div>
            <button
              onClick={(e) => handleDeleteCustom(preset.id, e)}
              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
              title="Delete Preset"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* JSON Import/Export */}
      <div className="flex items-center justify-end gap-2 text-[11px] font-sans text-slate-500 pt-1">
        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
          <Upload className="w-3 h-3" />
          <span>Load JSON</span>
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </label>
        <span>•</span>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1 hover:text-slate-300 transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
};
