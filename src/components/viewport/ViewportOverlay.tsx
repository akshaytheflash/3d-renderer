import React from 'react';
import { Compass, RotateCcw, Box, Eye, Layers } from 'lucide-react';
import { GeometryMetrics } from '../../types/configurator';

interface ViewportOverlayProps {
  metrics: GeometryMetrics;
  isOverhangMode: boolean;
  isSlicerActive: boolean;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  metrics,
  isOverhangMode,
  isSlicerActive,
}) => {
  const handleViewClick = (view: 'iso' | 'top' | 'front' | 'right') => {
    if ((window as any).__KINETIC_SET_CAMERA_VIEW) {
      (window as any).__KINETIC_SET_CAMERA_VIEW(view);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Left: Model Telemetry HUD */}
      <div className="pointer-events-auto flex items-start gap-3">
        <div className="bg-[#12161f]/85 border border-[#232b38] backdrop-blur-md px-3.5 py-2.5 rounded-sm shadow-xl text-xs font-mono flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#8e9dae] pb-1 border-b border-[#232b38]/60">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            <span className="font-semibold tracking-wider text-[#e1e7ec]">GEOMETRY TELEMETRY</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#8e9dae]">
            <div>FACETS: <span className="text-[#e1e7ec] font-semibold">{metrics.faceCount.toLocaleString()}</span></div>
            <div>VERTS: <span className="text-[#e1e7ec] font-semibold">{metrics.vertexCount.toLocaleString()}</span></div>
            <div>DIM (X×Y×Z): <span className="text-[#00f0ff]">{metrics.boundingBox.width}×{metrics.boundingBox.height}×{metrics.boundingBox.depth} mm</span></div>
            <div>STATUS: <span className={metrics.isWatertight ? 'text-[#10b981] font-semibold' : 'text-[#f59e0b]'}>{metrics.isWatertight ? 'MANIFOLD (OK)' : 'NON-MANIFOLD'}</span></div>
          </div>
        </div>

        {/* Diagnostic Alert Pills */}
        {isOverhangMode && (
          <div className="bg-[#12161f]/90 border border-[#ff8400]/70 text-[#ff8400] px-3 py-2 rounded-sm text-xs font-mono flex items-center gap-2 backdrop-blur-md shadow-lg animate-fade-in">
            <Eye className="w-4 h-4 text-[#ff8400]" />
            <span>OVERHANG HEATMAP ACTIVE // RED = SUPPORT REQUIRED</span>
          </div>
        )}

        {isSlicerActive && (
          <div className="bg-[#12161f]/90 border border-[#00f0ff]/70 text-[#00f0ff] px-3 py-2 rounded-sm text-xs font-mono flex items-center gap-2 backdrop-blur-md shadow-lg animate-fade-in">
            <Layers className="w-4 h-4 text-[#00f0ff]" />
            <span>SLICER TOOLPATH ACTIVE // HORIZONTAL CONTOURS</span>
          </div>
        )}
      </div>

      {/* Top Right: Viewport Quick-Cam Orientation Switcher */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[#12161f]/85 border border-[#232b38] backdrop-blur-md p-1 rounded-sm shadow-xl self-end">
        <button
          onClick={() => handleViewClick('iso')}
          className="px-2.5 py-1 text-xs font-mono font-medium text-[#8e9dae] hover:text-[#00f0ff] hover:bg-[#1b2330] rounded-sm transition-colors flex items-center gap-1"
          title="Isometric View"
        >
          <Box className="w-3.5 h-3.5" />
          ISO
        </button>
        <button
          onClick={() => handleViewClick('top')}
          className="px-2.5 py-1 text-xs font-mono font-medium text-[#8e9dae] hover:text-[#00f0ff] hover:bg-[#1b2330] rounded-sm transition-colors"
          title="Top Plan View"
        >
          TOP
        </button>
        <button
          onClick={() => handleViewClick('front')}
          className="px-2.5 py-1 text-xs font-mono font-medium text-[#8e9dae] hover:text-[#00f0ff] hover:bg-[#1b2330] rounded-sm transition-colors"
          title="Front Elevation View"
        >
          FRONT
        </button>
        <button
          onClick={() => handleViewClick('right')}
          className="px-2.5 py-1 text-xs font-mono font-medium text-[#8e9dae] hover:text-[#00f0ff] hover:bg-[#1b2330] rounded-sm transition-colors"
          title="Right Profile View"
        >
          RIGHT
        </button>
        <div className="w-[1px] h-4 bg-[#232b38] mx-0.5"></div>
        <button
          onClick={() => handleViewClick('iso')}
          className="p-1 text-[#8e9dae] hover:text-[#00f0ff] hover:bg-[#1b2330] rounded-sm transition-colors"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
