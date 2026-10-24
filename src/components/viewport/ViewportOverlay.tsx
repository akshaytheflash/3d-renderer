import React from 'react';
import { RotateCcw, Box, Eye, Layers } from 'lucide-react';
import { GeometryMetrics } from '../../types/configurator';
import { CameraView, CameraViewController } from './ThreeCanvas';

interface ViewportOverlayProps {
  metrics: GeometryMetrics;
  isOverhangMode: boolean;
  isSlicerActive: boolean;
  onSetCameraView?: CameraViewController;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  metrics,
  isOverhangMode,
  isSlicerActive,
  onSetCameraView,
}) => {
  const handleViewClick = (view: CameraView) => {
    onSetCameraView?.(view);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Left: Model Telemetry HUD */}
      <div className="pointer-events-auto flex items-start gap-3">
        <div className="bg-slate-900/85 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded shadow-xl text-xs font-sans flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-semibold tracking-wide text-white text-[11px]">Mesh Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 text-xs">
            <div>Triangles: <span className="font-mono text-white font-semibold">{metrics.faceCount.toLocaleString()}</span></div>
            <div>Vertices: <span className="font-mono text-white font-semibold">{metrics.vertexCount.toLocaleString()}</span></div>
            <div>Dimensions: <span className="font-mono text-cyan-400 font-medium">{metrics.boundingBox.width}×{metrics.boundingBox.height}×{metrics.boundingBox.depth} mm</span></div>
            <div>Status: <span className={`font-sans font-semibold ${metrics.isWatertight ? 'text-emerald-400' : 'text-amber-400'}`}>{metrics.isWatertight ? 'Watertight Solid' : 'Non-Manifold'}</span></div>
          </div>
        </div>

        {/* Diagnostic Alert Badges */}
        {isOverhangMode && (
          <div className="bg-slate-900/90 border border-amber-500/50 text-amber-400 px-3 py-2 rounded text-xs font-sans flex items-center gap-2 backdrop-blur-md shadow-lg animate-fade-in">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Overhang Heatmap Active (Red = Supports Needed)</span>
          </div>
        )}

        {isSlicerActive && (
          <div className="bg-slate-900/90 border border-cyan-500/50 text-cyan-400 px-3 py-2 rounded text-xs font-sans flex items-center gap-2 backdrop-blur-md shadow-lg animate-fade-in">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Layer Slicing Simulation Active</span>
          </div>
        )}
      </div>

      {/* Top Right: Viewport Quick-Cam Orientation Switcher */}
      {/* mb-12 keeps it clear of the bottom shader deck's click area */}
      <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/85 border border-white/10 backdrop-blur-md p-1 rounded shadow-xl self-end mb-12 text-xs font-sans">
        <button
          onClick={() => handleViewClick('iso')}
          className="px-2.5 py-1 font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
          title="Isometric View"
        >
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          ISO
        </button>
        <button
          onClick={() => handleViewClick('top')}
          className="px-2.5 py-1 font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Top Plan View"
        >
          Top
        </button>
        <button
          onClick={() => handleViewClick('front')}
          className="px-2.5 py-1 font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Front Elevation View"
        >
          Front
        </button>
        <button
          onClick={() => handleViewClick('right')}
          className="px-2.5 py-1 font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Right Profile View"
        >
          Right
        </button>
        <div className="w-[1px] h-3.5 bg-white/10 mx-0.5"></div>
        <button
          onClick={() => handleViewClick('iso')}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Reset Camera"
          aria-label="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
