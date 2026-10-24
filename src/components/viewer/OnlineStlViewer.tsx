import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  UploadCloud,
  FileCheck2,
  Box,
  Layers,
  Sparkles,
  Download,
  Eye,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { parseSTL, parseOBJ, getSampleModel } from '../../core/loaders/stlLoader';
import { calculateGeometryMetrics } from '../../core/analyzers/volumeCalculator';
import { exportBinarySTL, downloadFile } from '../../core/exporters/stlExporter';
import { exportOBJ } from '../../core/exporters/objExporter';
import { captureCanvasSnapshot } from '../../core/exporters/snapshot';
import { sound } from '../../core/audio/synthAudio';
import { ThreeCanvas } from '../viewport/ThreeCanvas';
import { ConfiguratorState, GeometryMetrics, BED_PRESETS } from '../../types/configurator';

interface OnlineStlViewerProps {
  baseState: ConfiguratorState;
}

export const OnlineStlViewer: React.FC<OnlineStlViewerProps> = ({ baseState }) => {
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(() =>
    getSampleModel('turbine')
  );
  const [fileName, setFileName] = useState<string>('sample-aerospike-turbine.stl');
  const [fileSize, setFileSize] = useState<string>('1.4 MB');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rendererInstance, setRendererInstance] = useState<THREE.WebGLRenderer | null>(null);

  // Local viewer display state
  const [viewerState, setViewerState] = useState<ConfiguratorState>({
    ...baseState,
    materialMode: 'studio',
    showBedGrid: true,
    showBoundingBox: true,
    wireframeOverlay: false,
    selectedBed: 'bambu-x1c',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-compute metrics on loaded geometry
  const metrics: GeometryMetrics = useMemo(() => {
    return calculateGeometryMetrics(activeGeometry, viewerState.overhangThreshold);
  }, [activeGeometry, viewerState.overhangThreshold]);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    sound.playMorph();
    try {
      const name = file.name.toLowerCase();
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

      if (name.endsWith('.stl')) {
        const buffer = await file.arrayBuffer();
        const parsed = parseSTL(buffer);
        setActiveGeometry(parsed);
      } else if (name.endsWith('.obj')) {
        const text = await file.text();
        const parsed = parseOBJ(text);
        setActiveGeometry(parsed);
      } else {
        alert('Supported 3D formats are .stl (binary & ascii) and .obj');
      }
      sound.playExportSuccess();
    } catch (err) {
      console.error(err);
      alert('Error parsing 3D file. Please ensure it is a valid STL or OBJ file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sampleKey: 'bunny' | 'turbine' | 'vase') => {
    sound.playClick(500);
    const names = {
      turbine: 'sample-aerospike-turbine.stl',
      bunny: 'sample-geometric-totem.stl',
      vase: 'sample-spiral-vessel.stl',
    };
    setFileName(names[sampleKey]);
    setFileSize('850 KB');
    setActiveGeometry(getSampleModel(sampleKey));
  };

  const handleExportStl = () => {
    const blob = exportBinarySTL(activeGeometry);
    downloadFile(blob, `${fileName.replace(/\.[^/.]+$/, '')}-processed.stl`);
    sound.playExportSuccess();
  };

  const handleExportObj = () => {
    const blob = exportOBJ(activeGeometry, 'ViewerMesh');
    downloadFile(blob, `${fileName.replace(/\.[^/.]+$/, '')}-processed.obj`);
    sound.playExportSuccess();
  };

  const handleSnapshot = () => {
    if (rendererInstance) {
      captureCanvasSnapshot(rendererInstance, `${fileName.replace(/\.[^/.]+$/, '')}-render.png`);
      sound.playExportSuccess();
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-950 text-slate-100"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.obj"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center p-8 backdrop-blur-md">
          <UploadCloud className="w-16 h-16 text-cyan-400 animate-bounce mb-4" />
          <h2 className="text-xl font-sans font-semibold text-white">Drop your 3D model here</h2>
          <p className="text-sm font-sans text-slate-400 mt-1">Supports STL (Binary & ASCII) and OBJ files</p>
        </div>
      )}

      {/* Main 3D Viewport */}
      <div className="relative flex-1 h-[60vh] md:h-full overflow-hidden">
        <ThreeCanvas
          geometry={activeGeometry}
          state={viewerState}
          onRendererReady={setRendererInstance}
        />

        {/* Viewport Floating Top Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-md px-3.5 py-2 shadow-xl flex items-center gap-3">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="font-sans font-semibold text-xs text-white truncate max-w-[200px]">
                {fileName}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{fileSize}</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-2 px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-semibold text-xs transition-colors shadow-sm"
            >
              Open File
            </button>
          </div>

          {/* Sample Models Bar */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 p-1 rounded-md text-xs font-sans text-slate-400">
            <span className="px-2 text-[11px] font-medium text-slate-500">Samples:</span>
            <button
              onClick={() => loadSample('turbine')}
              className="px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors"
            >
              Turbine
            </button>
            <button
              onClick={() => loadSample('bunny')}
              className="px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors"
            >
              Poly Totem
            </button>
            <button
              onClick={() => loadSample('vase')}
              className="px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors"
            >
              Spiral Vessel
            </button>
          </div>
        </div>

        {/* Viewport Bottom Quick Shading Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-white/10 p-1.5 rounded-md shadow-xl text-xs font-sans">
          {(
            [
              { id: 'studio', label: 'Studio PBR' },
              { id: 'clay', label: 'Matte Clay' },
              { id: 'titanium', label: 'Titanium' },
              { id: 'overhang', label: 'Overhang Heatmap' },
              { id: 'wireframe', label: 'Wireframe' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setViewerState((prev) => ({ ...prev, materialMode: mode.id }));
                sound.playClick(500);
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewerState.materialMode === mode.id
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

          {/* Wireframe & Grid toggle */}
          <button
            onClick={() => {
              setViewerState((p) => ({ ...p, wireframeOverlay: !p.wireframeOverlay }));
              sound.playClick(440);
            }}
            className={`p-1.5 rounded border transition-colors ${
              viewerState.wireframeOverlay
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'text-slate-400 border-white/5 hover:text-white'
            }`}
            title="Wireframe overlay"
          >
            <Box className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setViewerState((p) => ({ ...p, showBoundingBox: !p.showBoundingBox }));
              sound.playClick(440);
            }}
            className={`p-1.5 rounded border transition-colors ${
              viewerState.showBoundingBox
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'text-slate-400 border-white/5 hover:text-white'
            }`}
            title="Bounding Dimensions"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Inspection & Telemetry Wing */}
      <div className="w-full md:w-96 h-[40vh] md:h-full bg-slate-900/90 border-t md:border-t-0 md:border-l border-white/10 backdrop-blur-xl flex flex-col p-4 overflow-y-auto space-y-4">
        {/* Panel Title */}
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <h2 className="font-sans font-semibold text-sm text-white">3D Model Telemetry</h2>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium flex items-center gap-1 ${
              metrics.isWatertight
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {metrics.isWatertight ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {metrics.isWatertight ? 'Watertight Solid' : 'Open Edges'}
          </span>
        </div>

        {/* Geometry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Triangles</span>
            <span className="font-mono text-sm font-semibold text-white">
              {metrics.faceCount.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Vertices</span>
            <span className="font-mono text-sm font-semibold text-white">
              {metrics.vertexCount.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Calculated Volume</span>
            <span className="font-mono text-sm font-semibold text-cyan-400">
              {metrics.volumeCm3} <span className="text-xs text-slate-500 font-normal">cm³</span>
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-0.5">Surface Area</span>
            <span className="font-mono text-sm font-semibold text-white">
              {metrics.surfaceAreaCm2} <span className="text-xs text-slate-500 font-normal">cm²</span>
            </span>
          </div>
        </div>

        {/* Dimensions Card */}
        <div className="bg-slate-950/60 p-3 rounded border border-white/5 space-y-2">
          <span className="text-xs font-sans font-medium text-slate-300 block">
            Bounding Box Envelope
          </span>
          <div className="flex items-center justify-between font-mono text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded">
            <span>X: <strong className="text-white">{metrics.boundingBox.width}</strong> mm</span>
            <span>Y: <strong className="text-white">{metrics.boundingBox.height}</strong> mm</span>
            <span>Z: <strong className="text-white">{metrics.boundingBox.depth}</strong> mm</span>
          </div>
        </div>

        {/* Diagnostics & Printability */}
        <div className="bg-slate-950/60 p-3 rounded border border-white/5 space-y-2">
          <span className="text-xs font-sans font-medium text-slate-300 block">
            Printability Health Check
          </span>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            {metrics.diagnosticSuggestion}
          </p>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-sans">Overhang &gt; 45°:</span>
            <span
              className={`font-mono font-semibold ${
                metrics.overhangWarningAreaPercentage > 15
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {metrics.overhangWarningAreaPercentage}% of Area
            </span>
          </div>
        </div>

        {/* Export & Actions Deck */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleExportStl}
            className="w-full py-2.5 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            Download Binary STL (3D Print Ready)
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportObj}
              className="py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-medium border border-white/5 transition-colors"
            >
              Export OBJ
            </button>
            <button
              onClick={handleSnapshot}
              className="py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-medium border border-white/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              Capture PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
