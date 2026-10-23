import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConfiguratorState, BED_PRESETS } from '../../types/configurator';
import { getMaterialForMode } from '../../core/shaders/matcapShaders';
import { createOverhangMaterial } from '../../core/shaders/overhangShader';

interface ThreeCanvasProps {
  geometry: THREE.BufferGeometry | null;
  state: ConfiguratorState;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  sliceGeometry?: THREE.BufferGeometry | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  geometry,
  state,
  onRendererReady,
  sliceGeometry,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const bedGroupRef = useRef<THREE.Group | null>(null);
  const sliceLinesRef = useRef<THREE.LineSegments | null>(null);
  const bboxHelperRef = useRef<THREE.BoxHelper | null>(null);

  // Setup Scene, Camera, Renderer, Controls
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0a0d12');

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(160, 180, 240);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    if (onRendererReady) {
      onRendererReady(renderer);
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 20;
    controls.target.set(0, 50, 0);
    controlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(120, 200, 150);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.bias = -0.0005;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f0ff, 0.6); // Cyan rim light
    dirLight2.position.set(-150, 80, -120);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xff8400, 0.35); // Warm fill
    dirLight3.position.set(0, -50, 100);
    scene.add(dirLight3);

    // Bed Group
    const bedGroup = new THREE.Group();
    scene.add(bedGroup);
    bedGroupRef.current = bedGroup;

    // Main Mesh placeholder
    const mesh = new THREE.Mesh();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mainMeshRef.current = mesh;

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update Bed & Grid when selectedBed or showBedGrid changes
  useEffect(() => {
    if (!bedGroupRef.current) return;
    const bedGroup = bedGroupRef.current;
    bedGroup.clear();

    if (!state.showBedGrid) return;

    const bedSpec = BED_PRESETS[state.selectedBed] || BED_PRESETS['bambu-x1c'];
    const { x: bedX, y: bedZ, z: bedY } = bedSpec; // Three.js Y is height!

    // 1. Grid Helper on print bed surface
    const grid = new THREE.GridHelper(Math.max(bedX, bedZ), Math.round(Math.max(bedX, bedZ) / 10), 0x38465c, 0x1b2330);
    grid.position.y = 0.05;
    bedGroup.add(grid);

    // 2. Bed Outline Plate
    const bedPlateGeo = new THREE.PlaneGeometry(bedX, bedZ);
    bedPlateGeo.rotateX(-Math.PI / 2);
    const bedPlateMat = new THREE.MeshBasicMaterial({
      color: 0x0f131a,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const bedPlate = new THREE.Mesh(bedPlateGeo, bedPlateMat);
    bedPlate.receiveShadow = true;
    bedGroup.add(bedPlate);

    // 3. Bed Border Line
    const borderEdges = new THREE.EdgesGeometry(bedPlateGeo);
    const borderLine = new THREE.LineSegments(borderEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 }));
    borderLine.position.y = 0.1;
    bedGroup.add(borderLine);

    // 4. Printable Volume Bounding Cage
    const boxGeo = new THREE.BoxGeometry(bedX, bedY, bedZ);
    boxGeo.translate(0, bedY / 2, 0);
    const cageEdges = new THREE.EdgesGeometry(boxGeo);
    const cage = new THREE.LineSegments(
      cageEdges,
      new THREE.LineBasicMaterial({ color: 0x2e3846, transparent: true, opacity: 0.4 })
    );
    bedGroup.add(cage);
  }, [state.selectedBed, state.showBedGrid]);

  // Update Geometry & Materials
  useEffect(() => {
    if (!mainMeshRef.current || !sceneRef.current) return;
    const mesh = mainMeshRef.current;
    const scene = sceneRef.current;

    if (!geometry) {
      mesh.visible = false;
      return;
    }

    mesh.visible = true;
    mesh.geometry = geometry;

    // Setup Clipping Planes
    const clippingPlanes: THREE.Plane[] = [];
    if (state.clippingEnabled && geometry.boundingBox) {
      const bb = geometry.boundingBox;
      if (state.clippingPlane === 'y') {
        const h = bb.max.y - bb.min.y;
        const clipY = bb.min.y + h * (1.0 - state.clippingOffset);
        clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), clipY));
      } else if (state.clippingPlane === 'x') {
        const w = bb.max.x - bb.min.x;
        const clipX = bb.min.x + w * (state.clippingOffset - 0.5);
        clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipX));
      } else if (state.clippingPlane === 'z') {
        const d = bb.max.z - bb.min.z;
        const clipZ = bb.min.z + d * (state.clippingOffset - 0.5);
        clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ));
      }
    }

    // Material
    if (state.materialMode === 'overhang') {
      mesh.material = createOverhangMaterial(state.overhangThreshold);
      (mesh.material as THREE.ShaderMaterial).clippingPlanes = clippingPlanes;
    } else {
      mesh.material = getMaterialForMode(state.materialMode, state.materialColor, clippingPlanes);
    }

    // Wireframe Overlay
    if (wireframeMeshRef.current) {
      scene.remove(wireframeMeshRef.current);
      wireframeMeshRef.current.geometry.dispose();
      wireframeMeshRef.current = null;
    }

    if (state.wireframeOverlay && state.materialMode !== 'wireframe') {
      const edges = new THREE.EdgesGeometry(geometry, 30);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.35,
        clippingPlanes,
      });
      const wireLines = new THREE.LineSegments(edges, wireMat);
      scene.add(wireLines);
      wireframeMeshRef.current = wireLines;
    }

    // Bounding Box Helper
    if (bboxHelperRef.current) {
      scene.remove(bboxHelperRef.current);
      bboxHelperRef.current.dispose();
      bboxHelperRef.current = null;
    }

    if (state.showBoundingBox) {
      const helper = new THREE.BoxHelper(mesh, 0xff8400);
      scene.add(helper);
      bboxHelperRef.current = helper;
    }
  }, [
    geometry,
    state.materialMode,
    state.materialColor,
    state.wireframeOverlay,
    state.showBoundingBox,
    state.clippingEnabled,
    state.clippingPlane,
    state.clippingOffset,
    state.overhangThreshold,
  ]);

  // Slicer Toolpath Visualization
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (sliceLinesRef.current) {
      scene.remove(sliceLinesRef.current);
      sliceLinesRef.current.geometry.dispose();
      sliceLinesRef.current = null;
    }

    if (state.slicerActive && sliceGeometry) {
      const sliceMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        linewidth: 2,
      });
      const lines = new THREE.LineSegments(sliceGeometry, sliceMat);
      scene.add(lines);
      sliceLinesRef.current = lines;

      // Dim main mesh to accentuate slicer toolpath
      if (mainMeshRef.current) {
        if (Array.isArray(mainMeshRef.current.material)) {
          mainMeshRef.current.material.forEach((m) => (m.opacity = 0.25));
        } else {
          mainMeshRef.current.material.opacity = 0.25;
          mainMeshRef.current.material.transparent = true;
        }
      }
    } else if (mainMeshRef.current) {
      if (!Array.isArray(mainMeshRef.current.material)) {
        mainMeshRef.current.material.opacity = 1.0;
        mainMeshRef.current.material.transparent = state.materialMode === 'resin';
      }
    }
  }, [state.slicerActive, sliceGeometry]);

  // Camera View Switcher
  const setCameraView = useCallback((view: 'iso' | 'top' | 'front' | 'right') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const target = new THREE.Vector3(0, 50, 0);
    controls.target.copy(target);

    switch (view) {
      case 'top':
        camera.position.set(0, 320, 0.01);
        break;
      case 'front':
        camera.position.set(0, 50, 300);
        break;
      case 'right':
        camera.position.set(300, 50, 0);
        break;
      case 'iso':
      default:
        camera.position.set(160, 180, 240);
        break;
    }
    controls.update();
  }, []);

  // Expose camera view switcher globally on window for overlay controls
  useEffect(() => {
    (window as any).__KINETIC_SET_CAMERA_VIEW = setCameraView;
    return () => {
      delete (window as any).__KINETIC_SET_CAMERA_VIEW;
    };
  }, [setCameraView]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing outline-none"
    />
  );
};
