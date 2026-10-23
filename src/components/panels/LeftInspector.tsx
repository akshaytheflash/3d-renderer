import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { ConfiguratorState, GeneratorType, Preset } from '../../types/configurator';
import { ParameterControl } from '../controls/ParameterControl';
import { GeneratorTabs } from '../controls/GeneratorTabs';
import { PresetsBar } from '../controls/PresetsBar';
import { sound } from '../../core/audio/synthAudio';

interface LeftInspectorProps {
  state: ConfiguratorState;
  onChange: (updater: (prev: ConfiguratorState) => ConfiguratorState) => void;
  onApplyPreset: (preset: Preset) => void;
  onRandomize: () => void;
  onImportJson: (json: Partial<ConfiguratorState>) => void;
}

export const LeftInspector: React.FC<LeftInspectorProps> = ({
  state,
  onChange,
  onApplyPreset,
  onRandomize,
  onImportJson,
}) => {
  const updateVase = (key: keyof ConfiguratorState['vase'], val: any) => {
    onChange((prev) => ({
      ...prev,
      vase: { ...prev.vase, [key]: val },
    }));
  };

  const updateGear = (key: keyof ConfiguratorState['gear'], val: any) => {
    onChange((prev) => ({
      ...prev,
      gear: { ...prev.gear, [key]: val },
    }));
  };

  const updateSculpture = (key: keyof ConfiguratorState['sculpture'], val: any) => {
    onChange((prev) => ({
      ...prev,
      sculpture: { ...prev.sculpture, [key]: val },
    }));
  };

  const updateGyroid = (key: keyof ConfiguratorState['gyroid'], val: any) => {
    onChange((prev) => ({
      ...prev,
      gyroid: { ...prev.gyroid, [key]: val },
    }));
  };

  const updateLantern = (key: keyof ConfiguratorState['lantern'], val: any) => {
    onChange((prev) => ({
      ...prev,
      lantern: { ...prev.lantern, [key]: val },
    }));
  };

  return (
    <div className="w-80 md:w-96 h-full flex flex-col bg-[#12161f]/95 border-r border-[#232b38] backdrop-blur-xl z-20 select-none overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#232b38] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00f0ff]" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#e1e7ec]">
            MORPHOGENESIS ENGINE
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-sm border border-[#00f0ff]/30 font-semibold">
          PARAMETRIC
        </span>
      </div>

      {/* Generator Type Selector Tabs */}
      <div className="p-3 pb-2 border-b border-[#232b38]/50">
        <GeneratorTabs
          current={state.generatorType}
          onChange={(type: GeneratorType) => onChange((prev) => ({ ...prev, generatorType: type }))}
        />
      </div>

      {/* Parameter Sliders Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.generatorType === 'vase' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/40 font-semibold">
              VESSEL PROFILE & PROPORTIONS
            </div>
            <ParameterControl
              label="Height"
              value={state.vase.height}
              min={60}
              max={250}
              step={5}
              unit="mm"
              onChange={(v) => updateVase('height', v)}
            />
            <ParameterControl
              label="Base Radius"
              value={state.vase.baseRadius}
              min={15}
              max={80}
              step={1}
              unit="mm"
              onChange={(v) => updateVase('baseRadius', v)}
            />
            <ParameterControl
              label="Waist Radius"
              value={state.vase.waistRadius}
              min={10}
              max={70}
              step={1}
              unit="mm"
              onChange={(v) => updateVase('waistRadius', v)}
            />
            <ParameterControl
              label="Rim Radius"
              value={state.vase.rimRadius}
              min={15}
              max={80}
              step={1}
              unit="mm"
              onChange={(v) => updateVase('rimRadius', v)}
            />
            <ParameterControl
              label="Waist Position"
              value={state.vase.waistPosition}
              min={0.1}
              max={0.9}
              step={0.05}
              onChange={(v) => updateVase('waistPosition', v)}
            />

            <div className="text-[11px] font-mono text-[#8e9dae] pt-3 pb-1 border-b border-[#232b38]/40 font-semibold">
              KINETIC RIBS & SURFACE PERTURBATION
            </div>
            <ParameterControl
              label="Flute Count"
              value={state.vase.fluteCount}
              min={0}
              max={32}
              step={1}
              unit="lobes"
              onChange={(v) => updateVase('fluteCount', v)}
            />
            <ParameterControl
              label="Flute Depth"
              value={state.vase.fluteDepth}
              min={0}
              max={15}
              step={0.5}
              unit="mm"
              onChange={(v) => updateVase('fluteDepth', v)}
            />
            <ParameterControl
              label="Axial Twist"
              value={state.vase.twist}
              min={-6.28}
              max={6.28}
              step={0.1}
              unit="rad"
              onChange={(v) => updateVase('twist', v)}
            />
            <ParameterControl
              label="Wave Amplitude"
              value={state.vase.waveAmplitude}
              min={0}
              max={10}
              step={0.5}
              unit="mm"
              onChange={(v) => updateVase('waveAmplitude', v)}
            />

            <div className="text-[11px] font-mono text-[#8e9dae] pt-3 pb-1 border-b border-[#232b38]/40 font-semibold">
              3D PRINT HOLLOWING & SHELL
            </div>
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#8e9dae]">Hollow Print Mode</span>
              <button
                onClick={() => {
                  updateVase('isHollow', !state.vase.isHollow);
                  sound.playClick(600);
                }}
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-sm transition-colors border ${
                  state.vase.isHollow
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
                    : 'bg-[#1b2330] text-[#8e9dae] border-[#232b38]'
                }`}
              >
                {state.vase.isHollow ? 'HOLLOW' : 'SOLID'}
              </button>
            </div>
            {state.vase.isHollow && (
              <ParameterControl
                label="Wall Thickness"
                value={state.vase.wallThickness}
                min={1.2}
                max={8.0}
                step={0.4}
                unit="mm"
                onChange={(v) => updateVase('wallThickness', v)}
              />
            )}
          </div>
        )}

        {state.generatorType === 'gear' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/40 font-semibold">
              INVOLUTE TOOTH PROFILE
            </div>
            <ParameterControl
              label="Tooth Count (Z)"
              value={state.gear.toothCount}
              min={8}
              max={60}
              step={1}
              unit="teeth"
              onChange={(v) => updateGear('toothCount', v)}
            />
            <ParameterControl
              label="Module (m)"
              value={state.gear.module}
              min={1.5}
              max={8.0}
              step={0.5}
              unit="mm"
              onChange={(v) => updateGear('module', v)}
            />
            <ParameterControl
              label="Pressure Angle"
              value={state.gear.pressureAngle}
              min={14.5}
              max={25}
              step={0.5}
              unit="°"
              onChange={(v) => updateGear('pressureAngle', v)}
            />
            <ParameterControl
              label="Face Width"
              value={state.gear.faceWidth}
              min={6}
              max={40}
              step={2}
              unit="mm"
              onChange={(v) => updateGear('faceWidth', v)}
            />
            <ParameterControl
              label="Helix Angle"
              value={state.gear.helixAngle}
              min={0}
              max={45}
              step={2}
              unit="°"
              onChange={(v) => updateGear('helixAngle', v)}
            />

            <div className="text-[11px] font-mono text-[#8e9dae] pt-3 pb-1 border-b border-[#232b38]/40 font-semibold">
              BORE & SHAFT ATTACHMENT
            </div>
            <ParameterControl
              label="Bore Diameter"
              value={state.gear.boreDiameter}
              min={5}
              max={35}
              step={1}
              unit="mm"
              onChange={(v) => updateGear('boreDiameter', v)}
            />
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#8e9dae]">Shaft Keyway</span>
              <button
                onClick={() => {
                  updateGear('hasKeyway', !state.gear.hasKeyway);
                  sound.playClick(600);
                }}
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-sm transition-colors border ${
                  state.gear.hasKeyway
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
                    : 'bg-[#1b2330] text-[#8e9dae] border-[#232b38]'
                }`}
              >
                {state.gear.hasKeyway ? 'ENABLED' : 'NONE'}
              </button>
            </div>
            <ParameterControl
              label="Hub Boss Height"
              value={state.gear.hubHeight}
              min={0}
              max={25}
              step={1}
              unit="mm"
              onChange={(v) => updateGear('hubHeight', v)}
            />
            <ParameterControl
              label="Spoke Count"
              value={state.gear.spokeCount}
              min={0}
              max={8}
              step={1}
              unit="spokes"
              description="0 = Solid web, >2 = Lightened spokes"
              onChange={(v) => updateGear('spokeCount', v)}
            />
          </div>
        )}

        {state.generatorType === 'sculpture' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/40 font-semibold">
              TORUS KNOT WINDING RATIO (P / Q)
            </div>
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#8e9dae]">Topology Shape</span>
              <select
                value={state.sculpture.sculptureShape}
                onChange={(e) => {
                  updateSculpture('sculptureShape', e.target.value);
                  sound.playClick(500);
                }}
                className="bg-[#0a0d12] border border-[#232b38] text-[#00f0ff] text-xs font-mono px-2 py-1 rounded-sm focus:outline-none"
              >
                <option value="torus">Torus Knot (p, q)</option>
                <option value="mobius">Mobius Strip</option>
                <option value="spiral">Logarithmic Spiral</option>
              </select>
            </div>
            <ParameterControl
              label="Major Radius"
              value={state.sculpture.radius}
              min={25}
              max={90}
              step={5}
              unit="mm"
              onChange={(v) => updateSculpture('radius', v)}
            />
            <ParameterControl
              label="Tube Radius"
              value={state.sculpture.tubeRadius}
              min={3}
              max={18}
              step={0.5}
              unit="mm"
              onChange={(v) => updateSculpture('tubeRadius', v)}
            />
            {state.sculpture.sculptureShape === 'torus' && (
              <>
                <ParameterControl
                  label="P (Toroidal Turns)"
                  value={state.sculpture.p}
                  min={1}
                  max={9}
                  step={1}
                  onChange={(v) => updateSculpture('p', v)}
                />
                <ParameterControl
                  label="Q (Poloidal Turns)"
                  value={state.sculpture.q}
                  min={1}
                  max={9}
                  step={1}
                  onChange={(v) => updateSculpture('q', v)}
                />
              </>
            )}
            <ParameterControl
              label="Aero Rib Count"
              value={state.sculpture.ribCount}
              min={0}
              max={16}
              step={1}
              unit="fins"
              onChange={(v) => updateSculpture('ribCount', v)}
            />
            <ParameterControl
              label="Rib Depth"
              value={state.sculpture.ribDepth}
              min={0}
              max={4}
              step={0.2}
              unit="mm"
              onChange={(v) => updateSculpture('ribDepth', v)}
            />
            <ParameterControl
              label="Ribbon Twist Factor"
              value={state.sculpture.twistFactor}
              min={0}
              max={8}
              step={0.5}
              onChange={(v) => updateSculpture('twistFactor', v)}
            />
          </div>
        )}

        {state.generatorType === 'gyroid' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/40 font-semibold">
              TRIPLY PERIODIC MINIMAL SURFACE (TPMS)
            </div>
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#8e9dae]">Lattice Family</span>
              <select
                value={state.gyroid.latticeType}
                onChange={(e) => {
                  updateGyroid('latticeType', e.target.value);
                  sound.playClick(500);
                }}
                className="bg-[#0a0d12] border border-[#232b38] text-[#00f0ff] text-xs font-mono px-2 py-1 rounded-sm focus:outline-none"
              >
                <option value="gyroid">Gyroid TPMS</option>
                <option value="schwarz-p">Schwarz-P (Primitive)</option>
                <option value="diamond">Schwarz-D (Diamond)</option>
              </select>
            </div>
            <ParameterControl
              label="Cube Bounding Size"
              value={state.gyroid.size}
              min={40}
              max={110}
              step={5}
              unit="mm"
              onChange={(v) => updateGyroid('size', v)}
            />
            <ParameterControl
              label="Cell Frequency (Scale)"
              value={state.gyroid.scale}
              min={1.0}
              max={3.5}
              step={0.2}
              unit="waves"
              onChange={(v) => updateGyroid('scale', v)}
            />
            <ParameterControl
              label="Shell Wall Thickness"
              value={state.gyroid.thickness}
              min={0.3}
              max={1.4}
              step={0.1}
              onChange={(v) => updateGyroid('thickness', v)}
            />
            <ParameterControl
              label="Isovalue Offset"
              value={state.gyroid.isovalue}
              min={-0.8}
              max={0.8}
              step={0.1}
              onChange={(v) => updateGyroid('isovalue', v)}
            />
            <ParameterControl
              label="Mesh Resolution Density"
              value={state.gyroid.resolution}
              min={18}
              max={32}
              step={2}
              onChange={(v) => updateGyroid('resolution', v)}
            />
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#8e9dae]">Outer Boundary Plate Cage</span>
              <button
                onClick={() => {
                  updateGyroid('cageBoundary', !state.gyroid.cageBoundary);
                  sound.playClick(600);
                }}
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-sm transition-colors border ${
                  state.gyroid.cageBoundary
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60'
                    : 'bg-[#1b2330] text-[#8e9dae] border-[#232b38]'
                }`}
              >
                {state.gyroid.cageBoundary ? 'ON (PRINT READY)' : 'OFF'}
              </button>
            </div>
          </div>
        )}

        {state.generatorType === 'lantern' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8e9dae] pb-1 border-b border-[#232b38]/40 font-semibold">
              CELLULAR GEODESIC APERTURES
            </div>
            <ParameterControl
              label="Height"
              value={state.lantern.height}
              min={70}
              max={220}
              step={5}
              unit="mm"
              onChange={(v) => updateLantern('height', v)}
            />
            <ParameterControl
              label="Base Radius"
              value={state.lantern.radiusBottom}
              min={25}
              max={75}
              step={2}
              unit="mm"
              onChange={(v) => updateLantern('radiusBottom', v)}
            />
            <ParameterControl
              label="Top Radius"
              value={state.lantern.radiusTop}
              min={20}
              max={65}
              step={2}
              unit="mm"
              onChange={(v) => updateLantern('radiusTop', v)}
            />
            <ParameterControl
              label="Radial Columns"
              value={state.lantern.cellColumns}
              min={6}
              max={16}
              step={1}
              unit="cols"
              onChange={(v) => updateLantern('cellColumns', v)}
            />
            <ParameterControl
              label="Vertical Rows"
              value={state.lantern.cellRows}
              min={4}
              max={12}
              step={1}
              unit="rows"
              onChange={(v) => updateLantern('cellRows', v)}
            />
            <ParameterControl
              label="Window Aperture Size"
              value={state.lantern.apertureSize}
              min={0.2}
              max={0.8}
              step={0.05}
              description="Diamond angle optimized for 45° overhang"
              onChange={(v) => updateLantern('apertureSize', v)}
            />
            <ParameterControl
              label="Wall Thickness"
              value={state.lantern.wallThickness}
              min={1.6}
              max={6.0}
              step={0.4}
              unit="mm"
              onChange={(v) => updateLantern('wallThickness', v)}
            />
            <ParameterControl
              label="Twist Pitch"
              value={state.lantern.twistAngle}
              min={0}
              max={3.14}
              step={0.1}
              unit="rad"
              onChange={(v) => updateLantern('twistAngle', v)}
            />
          </div>
        )}

        {/* Preset Bank */}
        <PresetsBar
          state={state}
          onApplyPreset={onApplyPreset}
          onRandomize={onRandomize}
          onImportJson={onImportJson}
        />
      </div>
    </div>
  );
};
