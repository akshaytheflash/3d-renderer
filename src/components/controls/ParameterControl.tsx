import React, { useState, useEffect } from 'react';
import { RotateCcw, Minus, Plus } from 'lucide-react';
import { sound } from '../../core/audio/synthAudio';

interface ParameterControlProps {
  label: string;
  value: number;
  defaultValue?: number;
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
  defaultValue,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
}) => {
  const [localText, setLocalText] = useState(value.toString());
  const isModified = defaultValue !== undefined && Math.abs(value - defaultValue) > 1e-4;

  useEffect(() => {
    setLocalText(value.toString());
  }, [value]);

  const commitValue = (val: number) => {
    const clamped = Math.min(max, Math.max(min, val));
    // Round to avoid float precision drift (e.g. 0.300000000004)
    const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
    const rounded = parseFloat(clamped.toFixed(precision));
    onChange(rounded);
    setLocalText(rounded.toString());
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    commitValue(val);
    sound.playTick();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
  };

  const handleTextBlur = () => {
    const parsed = parseFloat(localText);
    if (!isNaN(parsed)) {
      commitValue(parsed);
    } else {
      setLocalText(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextBlur();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setLocalText(value.toString());
      (e.target as HTMLInputElement).blur();
    }
  };

  const stepDown = () => {
    commitValue(value - step);
    sound.playTick();
  };

  const stepUp = () => {
    commitValue(value + step);
    sound.playTick();
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      commitValue(defaultValue);
      sound.playClick(480);
    }
  };

  // Calculate percentage for background gradient fill
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex flex-col gap-1.5 py-2 group/param">
      {/* Label and Numeric Input Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-sans font-medium text-xs group-hover/param:text-white transition-colors">
            {label}
          </span>
          {isModified && (
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-cyan-400 p-0.5 rounded transition-colors"
              title={`Reset to default (${defaultValue}${unit})`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Micro-adjust buttons & Direct Numeric Box */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={stepDown}
            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors border border-white/5 active:scale-95"
            title="Step Down"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>

          <div className="flex items-center bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 focus-within:border-cyan-500/80 transition-colors">
            <input
              type="text"
              value={localText}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              className="w-12 text-right text-cyan-400 font-mono text-xs font-semibold bg-transparent focus:outline-none"
            />
            {unit && <span className="text-slate-500 font-mono text-[10px] ml-1">{unit}</span>}
          </div>

          <button
            type="button"
            onClick={stepUp}
            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors border border-white/5 active:scale-95"
            title="Step Up"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Slider Track with fill */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          style={{
            background: `linear-gradient(to right, #00f0ff 0%, #00f0ff ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
          className="w-full h-1.5 rounded appearance-none cursor-pointer accent-cyan-400 focus:outline-none transition-all"
        />
      </div>

      {description && (
        <span className="text-[10px] text-slate-500 font-sans leading-tight">
          {description}
        </span>
      )}
    </div>
  );
};
