import React, { useState } from 'react';
import {
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ConfiguratorState, GeneratorType, Preset } from '../../types/configurator';
import { ParameterControl } from '../controls/ParameterControl';
import { GeneratorTabs } from '../controls/GeneratorTabs';
import { PresetsBar } from '../controls/PresetsBar';
import { AccordionSection } from '../controls/AccordionSection';
import { sound } from '../../core/audio/synthAudio';
import { BUILTIN_PRESETS } from '../../core/presets/presetsList';

interface LeftInspectorProps {
  state: ConfiguratorState;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (updater: (prev: ConfiguratorState) => ConfiguratorState) => void;
  onApplyPreset: (preset: Preset) => void;
  onRandomize: () => void;
  onImportJson: (json: Partial<ConfiguratorState>) => void;
}

const GENERATORS: GeneratorType[] = ['vase', 'gear', 'sculpture', 'gyroid', 'lantern'];

export const LeftInspector: React.FC<LeftInspectorProps> = ({
  state,
  isCollapsed,
  onToggleCollapse,
  onChange,
  onApplyPreset,
  onRandomize,
  onImportJson,
}) => {
  // Accordion open/closed state, keyed per generator so toggling one
  // generator's sections never bleeds into another generator's view
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of GENERATORS) {
      for (const s of ['sec1', 'sec2', 'sec3']) {
        init[`${g}-${s}`] = true;
      }
    }
    return init;
  });

  const isSecOpen = (n: number) => openSections[`${state.generatorType}-sec${n}`] ?? true;

  const toggleSection = (n: number) => {
    const key = `${state.generatorType}-sec${n}`;
    setOpenSections((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
    sound.playClick(440);
  };

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

  // Defaults reference from built-in preset #0
  const defaultVase = BUILTIN_PRESETS[0].params;
  const defaultGear = BUILTIN_PRESETS[2].params;
  const defaultSculpture = BUILTIN_PRESETS[4].params;
  const defaultGyroid = BUILTIN_PRESETS[6].params;
  const defaultLantern = BUILTIN_PRESETS[7].params;

  if (isCollapsed) {
    return (
      <div className="h-full bg-slate-900/90 border-r border-white/10 backdrop-blur-xl flex flex-col items-center py-3 px-1.5 z-20">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Expand Parameters Panel"
          aria-label="Expand Parameters Panel"
        >
          <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-96 lg:w-[380px] h-full flex flex-col bg-slate-900/95 border-r border-white/10 backdrop-blur-xl z-20 select-none overflow-hidden shadow-2xl transition-all">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="font-sans font-semibold text-xs tracking-wide text-white">
            Procedural Parameters
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-sans font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-white/5">
            Real-time CAD
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Collapse Panel"
            aria-label="Collapse Parameters Panel"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Generator Selector Tabs */}
      <div className="p-3 border-b border-white/5">
        <GeneratorTabs
          current={state.generatorType}
          onChange={(type: GeneratorType) => onChange((prev) => ({ ...prev, generatorType: type }))}
        />
      </div>

      {/* Scrollable Accordion Parameter Bank */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
        {/* ===================== VASE ACCORDIONS ===================== */}
        {state.generatorType === 'vase' && (
          <>
            {/* Section 1: Dimensions */}
            <AccordionSection
              title="Profile & Dimensions"
              isOpen={isSecOpen(1)}
              onToggle={() => toggleSection(1)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Height"
                value={state.vase.height}
                defaultValue={defaultVase.height}
                min={60}
                max={250}
                step={5}
                unit="mm"
                onChange={(v) => updateVase('height', v)}
              />
              <ParameterControl
                label="Base Radius"
                value={state.vase.baseRadius}
                defaultValue={defaultVase.baseRadius}
                min={15}
                max={80}
                step={1}
                unit="mm"
                onChange={(v) => updateVase('baseRadius', v)}
              />
              <ParameterControl
                label="Waist Radius"
                value={state.vase.waistRadius}
                defaultValue={defaultVase.waistRadius}
                min={10}
                max={70}
                step={1}
                unit="mm"
                onChange={(v) => updateVase('waistRadius', v)}
              />
              <ParameterControl
                label="Rim Radius"
                value={state.vase.rimRadius}
                defaultValue={defaultVase.rimRadius}
                min={15}
                max={80}
                step={1}
                unit="mm"
                onChange={(v) => updateVase('rimRadius', v)}
              />
              <ParameterControl
                label="Waist Height Ratio"
                value={state.vase.waistPosition}
                defaultValue={defaultVase.waistPosition}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={(v) => updateVase('waistPosition', v)}
              />
            </AccordionSection>

            {/* Section 2: Kinetic Fluting */}
            <AccordionSection
              title="Fluting & Twist Effects"
              isOpen={isSecOpen(2)}
              onToggle={() => toggleSection(2)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Flute Count"
                value={state.vase.fluteCount}
                defaultValue={defaultVase.fluteCount}
                min={0}
                max={32}
                step={1}
                unit="lobes"
                onChange={(v) => updateVase('fluteCount', v)}
              />
              <ParameterControl
                label="Flute Depth"
                value={state.vase.fluteDepth}
                defaultValue={defaultVase.fluteDepth}
                min={0}
                max={15}
                step={0.5}
                unit="mm"
                onChange={(v) => updateVase('fluteDepth', v)}
              />
              <ParameterControl
                label="Axial Twist"
                value={state.vase.twist}
                defaultValue={defaultVase.twist}
                min={-6.28}
                max={6.28}
                step={0.1}
                unit="rad"
                onChange={(v) => updateVase('twist', v)}
              />
              <ParameterControl
                label="Wave Amplitude"
                value={state.vase.waveAmplitude}
                defaultValue={defaultVase.waveAmplitude}
                min={0}
                max={10}
                step={0.5}
                unit="mm"
                onChange={(v) => updateVase('waveAmplitude', v)}
              />
            </AccordionSection>

            {/* Section 3: 3D Print Hollowing */}
            <AccordionSection
              title="Shell & Printability"
              isOpen={isSecOpen(3)}
              onToggle={() => toggleSection(3)}
              contentClassName="space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-sans pt-1">
                <span className="text-slate-300">Print Structure Mode</span>
                <button
                  onClick={() => {
                    updateVase('isHollow', !state.vase.isHollow);
                    sound.playClick(600);
                  }}
                  className={`px-3 py-1 font-sans text-xs font-medium rounded transition-colors ${
                    state.vase.isHollow
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.vase.isHollow ? 'Hollow with Wall' : 'Solid Infill'}
                </button>
              </div>
              {state.vase.isHollow && (
                <ParameterControl
                  label="Wall Thickness"
                  value={state.vase.wallThickness}
                  defaultValue={defaultVase.wallThickness}
                  min={1.2}
                  max={8.0}
                  step={0.4}
                  unit="mm"
                  description="Minimum 2 perimeters recommended for watertight containers"
                  onChange={(v) => updateVase('wallThickness', v)}
                />
              )}
            </AccordionSection>
          </>
        )}

        {/* ===================== GEAR ACCORDIONS ===================== */}
        {state.generatorType === 'gear' && (
          <>
            <AccordionSection
              title="Involute Tooth Profile"
              isOpen={isSecOpen(1)}
              onToggle={() => toggleSection(1)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Tooth Count (Z)"
                value={state.gear.toothCount}
                defaultValue={defaultGear.toothCount}
                min={8}
                max={60}
                step={1}
                unit="teeth"
                onChange={(v) => updateGear('toothCount', v)}
              />
              <ParameterControl
                label="Module (m)"
                value={state.gear.module}
                defaultValue={defaultGear.module}
                min={1.5}
                max={8.0}
                step={0.5}
                unit="mm"
                onChange={(v) => updateGear('module', v)}
              />
              <ParameterControl
                label="Pressure Angle"
                value={state.gear.pressureAngle}
                defaultValue={defaultGear.pressureAngle}
                min={14.5}
                max={25}
                step={0.5}
                unit="°"
                onChange={(v) => updateGear('pressureAngle', v)}
              />
              <ParameterControl
                label="Face Width"
                value={state.gear.faceWidth}
                defaultValue={defaultGear.faceWidth}
                min={6}
                max={40}
                step={2}
                unit="mm"
                onChange={(v) => updateGear('faceWidth', v)}
              />
              <ParameterControl
                label="Helix Angle"
                value={state.gear.helixAngle}
                defaultValue={defaultGear.helixAngle}
                min={0}
                max={45}
                step={2}
                unit="°"
                onChange={(v) => updateGear('helixAngle', v)}
              />
            </AccordionSection>

            <AccordionSection
              title="Shaft Bore & Lightening"
              isOpen={isSecOpen(2)}
              onToggle={() => toggleSection(2)}
            >
              <ParameterControl
                label="Bore Diameter"
                value={state.gear.boreDiameter}
                defaultValue={defaultGear.boreDiameter}
                min={5}
                max={35}
                step={1}
                unit="mm"
                onChange={(v) => updateGear('boreDiameter', v)}
              />
              <div className="flex items-center justify-between py-1 text-xs font-sans">
                <span className="text-slate-300">Shaft Keyway</span>
                <button
                  onClick={() => {
                    updateGear('hasKeyway', !state.gear.hasKeyway);
                    sound.playClick(600);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    state.gear.hasKeyway
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.gear.hasKeyway ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <ParameterControl
                label="Hub Boss Height"
                value={state.gear.hubHeight}
                defaultValue={defaultGear.hubHeight}
                min={0}
                max={25}
                step={1}
                unit="mm"
                onChange={(v) => updateGear('hubHeight', v)}
              />
              <ParameterControl
                label="Spoke Cutouts"
                value={state.gear.spokeCount}
                defaultValue={defaultGear.spokeCount}
                min={0}
                max={8}
                step={1}
                unit="spokes"
                onChange={(v) => updateGear('spokeCount', v)}
              />
            </AccordionSection>
          </>
        )}

        {/* ===================== SCULPTURE ACCORDIONS ===================== */}
        {state.generatorType === 'sculpture' && (
          <>
            <AccordionSection
              title="Topology & Windings"
              isOpen={isSecOpen(1)}
              onToggle={() => toggleSection(1)}
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-300">Topology Shape</span>
                <select
                  value={state.sculpture.sculptureShape}
                  onChange={(e) => {
                    updateSculpture('sculptureShape', e.target.value);
                    sound.playClick(500);
                  }}
                  className="bg-slate-900 border border-white/10 text-cyan-400 text-xs font-sans rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="torus">Torus Knot (p, q)</option>
                  <option value="mobius">Mobius Ribbon</option>
                  <option value="spiral">Logarithmic Spiral</option>
                </select>
              </div>
              <ParameterControl
                label="Major Radius"
                value={state.sculpture.radius}
                defaultValue={defaultSculpture.radius}
                min={25}
                max={90}
                step={5}
                unit="mm"
                onChange={(v) => updateSculpture('radius', v)}
              />
              <ParameterControl
                label="Tube Radius"
                value={state.sculpture.tubeRadius}
                defaultValue={defaultSculpture.tubeRadius}
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
                    defaultValue={defaultSculpture.p}
                    min={1}
                    max={9}
                    step={1}
                    onChange={(v) => updateSculpture('p', v)}
                  />
                  <ParameterControl
                    label="Q (Poloidal Turns)"
                    value={state.sculpture.q}
                    defaultValue={defaultSculpture.q}
                    min={1}
                    max={9}
                    step={1}
                    onChange={(v) => updateSculpture('q', v)}
                  />
                </>
              )}
            </AccordionSection>

            <AccordionSection
              title="Finned Ribs & Surface"
              isOpen={isSecOpen(2)}
              onToggle={() => toggleSection(2)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Aero Rib Count"
                value={state.sculpture.ribCount}
                defaultValue={defaultSculpture.ribCount}
                min={0}
                max={16}
                step={1}
                unit="fins"
                onChange={(v) => updateSculpture('ribCount', v)}
              />
              <ParameterControl
                label="Rib Depth"
                value={state.sculpture.ribDepth}
                defaultValue={defaultSculpture.ribDepth}
                min={0}
                max={4}
                step={0.2}
                unit="mm"
                onChange={(v) => updateSculpture('ribDepth', v)}
              />
              <ParameterControl
                label="Twist Pitch"
                value={state.sculpture.twistFactor}
                defaultValue={defaultSculpture.twistFactor}
                min={0}
                max={8}
                step={0.5}
                onChange={(v) => updateSculpture('twistFactor', v)}
              />
            </AccordionSection>
          </>
        )}

        {/* ===================== GYROID ACCORDIONS ===================== */}
        {state.generatorType === 'gyroid' && (
          <>
            <AccordionSection
              title="TPMS Surface Parameters"
              isOpen={isSecOpen(1)}
              onToggle={() => toggleSection(1)}
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-300">Lattice Family</span>
                <select
                  value={state.gyroid.latticeType}
                  onChange={(e) => {
                    updateGyroid('latticeType', e.target.value);
                    sound.playClick(500);
                  }}
                  className="bg-slate-900 border border-white/10 text-cyan-400 text-xs font-sans rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="gyroid">Gyroid TPMS</option>
                  <option value="schwarz-p">Schwarz-P (Primitive)</option>
                  <option value="diamond">Schwarz-D (Diamond)</option>
                </select>
              </div>
              <ParameterControl
                label="Cell Frequency (Scale)"
                value={state.gyroid.scale}
                defaultValue={defaultGyroid.scale}
                min={1.0}
                max={3.5}
                step={0.2}
                unit="waves"
                onChange={(v) => updateGyroid('scale', v)}
              />
              <ParameterControl
                label="Shell Wall Thickness"
                value={state.gyroid.thickness}
                defaultValue={defaultGyroid.thickness}
                min={0.3}
                max={1.4}
                step={0.1}
                onChange={(v) => updateGyroid('thickness', v)}
              />
              <ParameterControl
                label="Isovalue Offset"
                value={state.gyroid.isovalue}
                defaultValue={defaultGyroid.isovalue}
                min={-0.8}
                max={0.8}
                step={0.1}
                onChange={(v) => updateGyroid('isovalue', v)}
              />
            </AccordionSection>

            <AccordionSection
              title="Bounding Box & Stability"
              isOpen={isSecOpen(2)}
              onToggle={() => toggleSection(2)}
            >
              <ParameterControl
                label="Bounding Size"
                value={state.gyroid.size}
                defaultValue={defaultGyroid.size}
                min={40}
                max={110}
                step={5}
                unit="mm"
                onChange={(v) => updateGyroid('size', v)}
              />
              <div className="flex items-center justify-between py-1 text-xs font-sans">
                <span className="text-slate-300">Outer Print Base Cage</span>
                <button
                  onClick={() => {
                    updateGyroid('cageBoundary', !state.gyroid.cageBoundary);
                    sound.playClick(600);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    state.gyroid.cageBoundary
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {state.gyroid.cageBoundary ? 'On' : 'Off'}
                </button>
              </div>
            </AccordionSection>
          </>
        )}

        {/* ===================== LANTERN ACCORDIONS ===================== */}
        {state.generatorType === 'lantern' && (
          <>
            <AccordionSection
              title="Tower Architecture"
              isOpen={isSecOpen(1)}
              onToggle={() => toggleSection(1)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Height"
                value={state.lantern.height}
                defaultValue={defaultLantern.height}
                min={70}
                max={220}
                step={5}
                unit="mm"
                onChange={(v) => updateLantern('height', v)}
              />
              <ParameterControl
                label="Base Radius"
                value={state.lantern.radiusBottom}
                defaultValue={defaultLantern.radiusBottom}
                min={25}
                max={75}
                step={2}
                unit="mm"
                onChange={(v) => updateLantern('radiusBottom', v)}
              />
              <ParameterControl
                label="Top Radius"
                value={state.lantern.radiusTop}
                defaultValue={defaultLantern.radiusTop}
                min={20}
                max={65}
                step={2}
                unit="mm"
                onChange={(v) => updateLantern('radiusTop', v)}
              />
              <ParameterControl
                label="Twist Pitch"
                value={state.lantern.twistAngle}
                defaultValue={defaultLantern.twistAngle}
                min={0}
                max={3.14}
                step={0.1}
                unit="rad"
                onChange={(v) => updateLantern('twistAngle', v)}
              />
            </AccordionSection>

            <AccordionSection
              title="Cellular Windows (45° Overhang)"
              isOpen={isSecOpen(2)}
              onToggle={() => toggleSection(2)}
              contentClassName="space-y-1"
            >
              <ParameterControl
                label="Radial Columns"
                value={state.lantern.cellColumns}
                defaultValue={defaultLantern.cellColumns}
                min={6}
                max={16}
                step={1}
                unit="cols"
                onChange={(v) => updateLantern('cellColumns', v)}
              />
              <ParameterControl
                label="Vertical Rows"
                value={state.lantern.cellRows}
                defaultValue={defaultLantern.cellRows}
                min={4}
                max={12}
                step={1}
                unit="rows"
                onChange={(v) => updateLantern('cellRows', v)}
              />
              <ParameterControl
                label="Window Aperture Size"
                value={state.lantern.apertureSize}
                defaultValue={defaultLantern.apertureSize}
                min={0.2}
                max={0.8}
                step={0.05}
                description="Optimized diamond slope for supportless 3D printing"
                onChange={(v) => updateLantern('apertureSize', v)}
              />
              <ParameterControl
                label="Wall Thickness"
                value={state.lantern.wallThickness}
                defaultValue={defaultLantern.wallThickness}
                min={1.6}
                max={6.0}
                step={0.4}
                unit="mm"
                onChange={(v) => updateLantern('wallThickness', v)}
              />
            </AccordionSection>
          </>
        )}

        {/* Presets and Mutation Bar */}
        <div className="pt-2">
          <PresetsBar
            state={state}
            onApplyPreset={onApplyPreset}
            onRandomize={onRandomize}
            onImportJson={onImportJson}
          />
        </div>
      </div>
    </div>
  );
};
