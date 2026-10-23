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

  // Filter presets matching current active generator type
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
      description: `User defined preset for ${state.generatorType.toUpperCase()}`,
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
      } catch (err) {
        alert('Invalid JSON preset file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-[#232b38]/70">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8e9dae] font-mono flex items-center gap-1.5 font-medium">
          <Bookmark className="w-3.5 h-3.5 text-[#00f0ff]" />
          PRESET MORPHOLOGIES
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onRandomize();
              sound.playMorph();
            }}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#12161f] border border-[#232b38] text-[#8e9dae] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
            title="Randomize Parameters"
          >
            <Dices className="w-3 h-3 text-[#00f0ff]" />
            MUTATE
          </button>

          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#12161f] border border-[#232b38] text-[#8e9dae] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
          >
            + SAVE
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="flex items-center gap-1.5 p-2 bg-[#0a0d12] border border-[#00f0ff]/40 rounded-sm">
          <input
            type="text"
            placeholder="Preset Name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="bg-[#12161f] border border-[#232b38] rounded-sm px-2 py-1 text-xs text-[#e1e7ec] flex-1 focus:border-[#00f0ff] focus:outline-none"
          />
          <button
            onClick={handleSaveCustom}
            className="p-1 rounded-sm bg-[#00f0ff] text-[#0a0d12] hover:bg-[#38bdf8] transition-colors"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Preset Pills List */}
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
        {matchingPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              onApplyPreset(preset);
              sound.playMorph();
            }}
            className="text-left px-2.5 py-1.5 rounded-sm bg-[#12161f] border border-[#232b38] hover:border-[#00f0ff]/60 hover:bg-[#1b2330] transition-colors group flex-1 min-w-[130px]"
          >
            <div className="text-[11px] font-mono font-medium text-[#e1e7ec] group-hover:text-[#00f0ff] truncate">
              {preset.name}
            </div>
            <div className="text-[9px] text-[#6b7b8e] truncate font-sans">
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
            className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-[#12161f] border border-[#232b38] hover:border-[#00f0ff]/60 hover:bg-[#1b2330] transition-colors cursor-pointer group flex-1 min-w-[130px]"
          >
            <div className="truncate">
              <div className="text-[11px] font-mono font-medium text-[#00f0ff] truncate">
                {preset.name}
              </div>
              <div className="text-[9px] text-[#8e9dae] truncate">Custom</div>
            </div>
            <button
              onClick={(e) => handleDeleteCustom(preset.id, e)}
              className="text-[#6b7b8e] hover:text-[#ef4444] p-1 transition-colors"
              title="Delete Preset"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* JSON Import/Export Bar */}
      <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-[#6b7b8e] pt-1">
        <label className="flex items-center gap-1 cursor-pointer hover:text-[#8e9dae] transition-colors">
          <Upload className="w-3 h-3" />
          <span>LOAD JSON</span>
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </label>
        <span>•</span>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1 hover:text-[#8e9dae] transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>DUMP JSON</span>
        </button>
      </div>
    </div>
  );
};
