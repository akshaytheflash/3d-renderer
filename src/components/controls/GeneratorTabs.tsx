import React from 'react';
import { Cylinder, Cog, Dna, Grid, Sparkles } from 'lucide-react';
import { GeneratorType } from '../../types/configurator';
import { sound } from '../../core/audio/synthAudio';

interface GeneratorTabsProps {
  current: GeneratorType;
  onChange: (type: GeneratorType) => void;
}

export const GeneratorTabs: React.FC<GeneratorTabsProps> = ({ current, onChange }) => {
  const tabs: { id: GeneratorType; label: string; icon: React.ReactNode; subtitle: string }[] = [
    { id: 'vase', label: 'Vessel', subtitle: 'Fluted Spiral', icon: <Cylinder className="w-3.5 h-3.5" /> },
    { id: 'gear', label: 'Gear', subtitle: 'Involute CAD', icon: <Cog className="w-3.5 h-3.5" /> },
    { id: 'sculpture', label: 'Knot', subtitle: 'Torus Mobius', icon: <Dna className="w-3.5 h-3.5" /> },
    { id: 'gyroid', label: 'Gyroid', subtitle: 'TPMS Lattice', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'lantern', label: 'Lantern', subtitle: 'Cellular Tower', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950/70 border border-white/5 rounded-md">
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onChange(tab.id);
              sound.playClick(580);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded transition-all text-center ${
              isActive
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`mb-1 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>{tab.icon}</div>
            <span className="font-sans text-[11px] font-medium leading-none">
              {tab.label}
            </span>
            <span className="text-[9px] text-slate-500 font-sans mt-0.5 hidden sm:block">
              {tab.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
};
