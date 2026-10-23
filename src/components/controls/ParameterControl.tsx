import React from 'react';
import { sound } from '../../core/audio/synthAudio';

interface ParameterControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  description?: string;
}

export const ParameterControl: React.FC<ParameterControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
}) => {
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    sound.playTick();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  return (
    <div className="flex flex-col gap-1.5 py-1.5 group">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8e9dae] group-hover:text-[#e1e7ec] transition-colors font-medium">
          {label}
        </span>
        <div className="flex items-center gap-1 font-mono">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumberChange}
            className="w-16 bg-[#0a0d12] border border-[#232b38] rounded-sm px-1.5 py-0.5 text-right text-[#00f0ff] focus:border-[#00f0ff] focus:outline-none transition-colors text-xs font-semibold"
          />
          {unit && <span className="text-[#8e9dae] text-[10px] w-5">{unit}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          className="w-full accent-[#00f0ff] cursor-pointer"
        />
      </div>

      {description && (
        <span className="text-[10px] text-[#6b7b8e] leading-tight font-sans">
          {description}
        </span>
      )}
    </div>
  );
};
