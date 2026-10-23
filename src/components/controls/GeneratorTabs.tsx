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
    { id: 'vase', label: 'VESSEL', subtitle: 'Fluted Spiral', icon: <Cylinder className="w-4 h-4" /> },
    { id: 'gear', label: 'GEAR', subtitle: 'Involute CAD', icon: <Cog className="w-4 h-4" /> },
    { id: 'sculpture', label: 'KNOT', subtitle: 'Torus Mobius', icon: <Dna className="w-4 h-4" /> },
    { id: 'gyroid', label: 'GYROID', subtitle: 'TPMS Lattice', icon: <Grid className="w-4 h-4" /> },
    { id: 'lantern', label: 'LANTERN', subtitle: 'Cellular Lamp', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-5 gap-1 p-1 bg-[#0a0d12]/90 border border-[#232b38] rounded-sm">
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onChange(tab.id);
              sound.playClick(580);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-sm transition-all text-center relative ${
              isActive
                ? 'bg-[#1b222d] text-[#00f0ff] border-b-2 border-[#00f0ff] shadow-sm'
                : 'text-[#8e9dae] hover:text-[#e1e7ec] hover:bg-[#12161f]'
            }`}
          >
            <div className={`mb-1 ${isActive ? 'text-[#00f0ff]' : 'text-[#8e9dae]'}`}>{tab.icon}</div>
            <span className="font-mono text-[11px] font-bold tracking-wider leading-none">
              {tab.label}
            </span>
            <span className="text-[9px] text-[#6b7b8e] font-sans mt-0.5 hidden sm:block">
              {tab.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
};
