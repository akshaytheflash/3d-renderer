import React from 'react';
import { X, Code2, Layers, Cpu, ShieldCheck, Terminal, Award } from 'lucide-react';
import { sound } from '../../core/audio/synthAudio';

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackModal: React.FC<TechStackModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="bg-[#12161f] border border-[#232b38] rounded-sm max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#232b38] flex items-center justify-between bg-[#0a0d12]">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="font-mono text-sm font-bold tracking-wider text-[#e1e7ec]">
                SYSTEM ARCHITECTURE & PORTFOLIO SPECIFICATION
              </h2>
              <span className="text-[10px] text-[#8e9dae] font-sans">
                Production-grade WebGL/Three.js Procedural 3D Configurator & Slicer
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              sound.playClick(400);
            }}
            className="text-[#8e9dae] hover:text-[#e1e7ec] p-1.5 rounded-sm hover:bg-[#1b2330] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#8e9dae] font-sans leading-relaxed">
          {/* Executive Summary */}
          <section className="space-y-2">
            <h3 className="font-mono text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00f0ff]" /> 1. Executive Portfolio Summary
            </h3>
            <p>
              <strong className="text-[#e1e7ec]">Kinetic Forge 3D</strong> is a high-performance, browser-based
              procedural CAD application engineered for real-time additive manufacturing and generative industrial design.
              It eliminates the typical generic AI aesthetics by employing a precision aerospace CAD design language
              (Forge-OS) built with strict typographic discipline, custom WebGL GLSL shaders, and mathematical surface generation.
            </p>
          </section>

          {/* Candidate Role & Engineering Highlights */}
          <section className="space-y-2 bg-[#0a0d12] p-4 rounded-sm border border-[#232b38]">
            <h3 className="font-mono text-xs font-bold text-[#ff8400] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ff8400]" /> 2. Key Engineering Contributions (Resume Bullets)
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-[#e1e7ec]">
              <li>
                <strong>Procedural Geometry Kernel:</strong> Authored mathematically grounded parametric engines in TypeScript, including involute gear tooth profiling, Triply Periodic Minimal Surfaces (Gyroid, Schwarz-P), and watertight fluted vessels with sub-millisecond CPU rebuild times.
              </li>
              <li>
                <strong>Physical Analysis & Calculus:</strong> Implemented the Divergence Theorem via signed tetrahedron volume summation to calculate exact manifold volume ($cm^3$), surface area, and center-of-mass directly on custom BufferGeometries.
              </li>
              <li>
                <strong>Diagnostic WebGL Shaders:</strong> Wrote custom GLSL vertex and fragment shaders computing surface normals relative to gravity vectors to render real-time printability heatmaps (flagging &gt;45° overhangs requiring support).
              </li>
              <li>
                <strong>Native Slicing Simulation:</strong> Built a toolpath intersection algorithm slicing 3D meshes along arbitrary layer heights (0.12mm–0.28mm) for interactive in-browser toolpath inspection.
              </li>
              <li>
                <strong>Zero-Dependency Binary STL Exporter:</strong> Implemented a low-level ArrayBuffer and DataView binary encoder creating valid 80-byte header, uint32 face count, and Little-Endian float32 normals, verified 100% compliant with Bambu Studio, PrusaSlicer, and Cura.
              </li>
              <li>
                <strong>Tactile UI & Auditory Synthesizer:</strong> Integrated Web Audio API to generate procedural micro-frequencies for interactive sliders, state undo/redo, and export notifications.
              </li>
            </ul>
          </section>

          {/* Tech Stack Breakdown */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00f0ff]" /> 3. Technology Stack & Libraries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="bg-[#0a0d12] p-3 rounded border border-[#232b38]">
                <div className="text-[#00f0ff] font-bold mb-1">Core & Runtime</div>
                <div className="text-[11px] text-[#e1e7ec]">React 19 + TypeScript + Vite</div>
                <div className="text-[10px] text-[#6b7b8e]">Zero runtime overhead, strict typing</div>
              </div>
              <div className="bg-[#0a0d12] p-3 rounded border border-[#232b38]">
                <div className="text-[#00f0ff] font-bold mb-1">3D Graphics & Shaders</div>
                <div className="text-[11px] text-[#e1e7ec]">Three.js + Raw WebGL GLSL</div>
                <div className="text-[10px] text-[#6b7b8e]">Custom PBR, Matcaps, Overhang Shaders</div>
              </div>
              <div className="bg-[#0a0d12] p-3 rounded border border-[#232b38]">
                <div className="text-[#00f0ff] font-bold mb-1">Styling & UI Tokens</div>
                <div className="text-[11px] text-[#e1e7ec]">Tailwind CSS v4 + Lucide Icons</div>
                <div className="text-[10px] text-[#6b7b8e]">No default AI slop; high-contrast CAD tokens</div>
              </div>
              <div className="bg-[#0a0d12] p-3 rounded border border-[#232b38]">
                <div className="text-[#00f0ff] font-bold mb-1">Sound & FX</div>
                <div className="text-[11px] text-[#e1e7ec]">Web Audio API + Canvas Confetti</div>
                <div className="text-[10px] text-[#6b7b8e]">Tactile feedback oscillators without audio assets</div>
              </div>
            </div>
          </section>

          {/* Mathematical Formulations */}
          <section className="space-y-2">
            <h3 className="font-mono text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00f0ff]" /> 4. Mathematical Foundations
            </h3>
            <div className="bg-[#0a0d12] p-3 rounded border border-[#232b38] font-mono text-[11px] space-y-2 text-[#e1e7ec]">
              <div>
                <span className="text-[#8e9dae]">// Watertight Tetrahedron Volume:</span><br />
                V = (1/6) * Σ [ v1 · (v2 × v3) ]
              </div>
              <div>
                <span className="text-[#8e9dae]">// Involute Gear Tooth Profile:</span><br />
                x = r_b * (cos t + t * sin t), y = r_b * (sin t - t * cos t)
              </div>
              <div>
                <span className="text-[#8e9dae]">// Gyroid Minimal Surface Isosurface:</span><br />
                f(x, y, z) = sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232b38] bg-[#0a0d12] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#6b7b8e]">
            Ready for portfolio repository & technical interview demos
          </span>
          <button
            onClick={() => {
              onClose();
              sound.playClick(440);
            }}
            className="px-4 py-1.5 bg-[#00f0ff] text-[#0a0d12] font-mono font-bold text-xs rounded-sm hover:bg-[#38bdf8] transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
