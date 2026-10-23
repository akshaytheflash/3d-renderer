import React from 'react';
import { X, Download, FileCode, Image, CheckCircle, FileText, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeometryMetrics } from '../../types/configurator';
import { sound } from '../../core/audio/synthAudio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: GeometryMetrics;
  onExportBinaryStl: () => void;
  onExportAsciiStl: () => void;
  onExportObj: () => void;
  onExportSnapshot: () => void;
  onExportJson: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onExportBinaryStl,
  onExportAsciiStl,
  onExportObj,
  onExportSnapshot,
  onExportJson,
}) => {
  if (!isOpen) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#ffffff', '#ff8400', '#10b981'],
    });
    sound.playExportSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12161f] border border-[#232b38] rounded-sm max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232b38]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-[#e1e7ec]">
              EXPORT ARTIFACT // 3D PRINT DISPATCH
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              sound.playClick(400);
            }}
            className="text-[#8e9dae] hover:text-[#e1e7ec] p-1 rounded-sm hover:bg-[#1b2330] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Geometry Status Banner */}
        <div className="bg-[#0a0d12] border border-[#232b38] p-3 rounded-sm text-xs font-mono flex items-center justify-between">
          <div>
            <span className="text-[#8e9dae]">GEOMETRY: </span>
            <span className="text-[#e1e7ec] font-semibold">{metrics.faceCount.toLocaleString()} Triangles</span>
          </div>
          <div>
            <span className="text-[#8e9dae]">VOLUME: </span>
            <span className="text-[#00f0ff] font-semibold">{metrics.volumeCm3} cm³</span>
          </div>
          <div className="flex items-center gap-1 text-[#10b981] font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>PRINT READY</span>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Binary STL */}
          <button
            onClick={() => {
              onExportBinaryStl();
              triggerCelebration();
            }}
            className="p-3.5 bg-[#0a0d12] border border-[#00f0ff]/40 hover:border-[#00f0ff] rounded-sm text-left group transition-all hover:bg-[#161d27]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#00f0ff]">BINARY STL</span>
              <span className="text-[9px] font-mono bg-[#00f0ff]/10 text-[#00f0ff] px-1.5 py-0.5 rounded border border-[#00f0ff]/30 font-semibold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[11px] text-[#8e9dae] leading-snug font-sans">
              Compact high-speed binary mesh with vertex normals. Standard for Bambu, Prusa & Cura.
            </p>
          </button>

          {/* Wavefront OBJ */}
          <button
            onClick={() => {
              onExportObj();
              triggerCelebration();
            }}
            className="p-3.5 bg-[#0a0d12] border border-[#232b38] hover:border-[#00f0ff] rounded-sm text-left group transition-all hover:bg-[#161d27]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#e1e7ec] group-hover:text-[#00f0ff]">
                WAVEFRONT OBJ
              </span>
              <FileCode className="w-3.5 h-3.5 text-[#8e9dae]" />
            </div>
            <p className="text-[11px] text-[#8e9dae] leading-snug font-sans">
              Standard 3D model format with vertex normals and UV texture coordinates for Blender/Maya.
            </p>
          </button>

          {/* ASCII STL */}
          <button
            onClick={() => {
              onExportAsciiStl();
              triggerCelebration();
            }}
            className="p-3.5 bg-[#0a0d12] border border-[#232b38] hover:border-[#00f0ff] rounded-sm text-left group transition-all hover:bg-[#161d27]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#e1e7ec] group-hover:text-[#00f0ff]">
                ASCII STL
              </span>
              <FileText className="w-3.5 h-3.5 text-[#8e9dae]" />
            </div>
            <p className="text-[11px] text-[#8e9dae] leading-snug font-sans">
              Human-readable raw facet text for CAD analysis and debugging triangular topology.
            </p>
          </button>

          {/* High-Res Snapshot */}
          <button
            onClick={() => {
              onExportSnapshot();
              triggerCelebration();
            }}
            className="p-3.5 bg-[#0a0d12] border border-[#232b38] hover:border-[#00f0ff] rounded-sm text-left group transition-all hover:bg-[#161d27]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#e1e7ec] group-hover:text-[#00f0ff]">
                SNAPSHOT PNG
              </span>
              <Image className="w-3.5 h-3.5 text-[#8e9dae]" />
            </div>
            <p className="text-[11px] text-[#8e9dae] leading-snug font-sans">
              High-resolution transparent viewport render for product design portfolios and documentation.
            </p>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-[#232b38] text-[11px] font-mono text-[#6b7b8e]">
          <span>Z-Up Bed Coordinate Remapping: ACTIVE</span>
          <button
            onClick={() => {
              onExportJson();
              triggerCelebration();
            }}
            className="hover:text-[#00f0ff] transition-colors underline"
          >
            Backup Preset JSON
          </button>
        </div>
      </div>
    </div>
  );
};
