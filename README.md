# ⚡ KINETIC FORGE 3D // Generative Geometry Engine & Additive Slicer

> **A high-performance, production-ready WebGL / Three.js 3D procedural configurator and additive manufacturing slicer.** Generate, customize, and manipulate real 3D geometry in real-time, inspect printability with custom GLSL overhang shaders, simulate G-code layer slicing, and export watertight Binary STL and OBJ files ready for 3D printing.

[![Live Vercel](https://img.shields.io/badge/Live%20Vercel-3drender--nine.vercel.app-black?style=for-the-badge&logo=vercel)](https://3drender-nine.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Flypod-00f0ff?style=for-the-badge&logo=cloudflare)](https://5524886921504696.flypod.page)
[![Mirror Demo](https://img.shields.io/badge/Mirror%20Demo-ShipStatic-10b981?style=for-the-badge)](https://turbo-micro-d43ytmy.shipstatic.com)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Deployments

- **Official Vercel Production**: [https://3drender-nine.vercel.app](https://3drender-nine.vercel.app)
- **Primary Cloudflare Edge (HTTPS)**: [https://5524886921504696.flypod.page](https://5524886921504696.flypod.page)
- **Secondary Mirror (HTTPS)**: [https://turbo-micro-d43ytmy.shipstatic.com](https://turbo-micro-d43ytmy.shipstatic.com)

---

## 🚀 Key Features

### 1. 🧬 Multi-Kernel Procedural Geometry Engine
- **Parametric Vessels & Vases**: Kinetic fluting lobes, continuous axial twist, vertical wave perturbation, and dual-wall hollowing with solid base for vase-mode or solid 3D printing.
- **Mechanical Involute Gears & Sprockets**: Rigorous mechanical engineering formulas ($m$, $Z$, $\alpha = 20^\circ$ or $14.5^\circ$), shaft bore with keyway slots, 5-spoke web cutouts, hub collars, and helical tooth twist.
- **Topological Knots & Mobius Sculptures**: Parametric $(p, q)$ torus knots and non-orientable Mobius ribbons with aerodynamic fin ribbing and flat build pads.
- **Triply Periodic Minimal Surfaces (TPMS Gyroid)**: Real-time implicit surface evaluation for Gyroid, Schwarz-P, and Diamond bio-additive lattice architectures with bounded cage frames.
- **Cellular Cyber Lanterns**: Support-free 45° overhang diamond apertures, internal LED hollow cavities, and weighted bases.

### 2. 🖨️ 3D Printability Diagnostics & Real-Time Slicer
- **Overhang Heatmap Shader**: Custom GLSL vertex & fragment shaders computing surface normals against the downward gravity vector:
  - `0° - 45°`: Safe printable zone (Emerald Green)
  - `45° - 60°`: Marginal overhang (Warning Amber)
  - `> 60°`: Critical overhang requiring supports (Signal Red)
- **Interactive Layer Slicer Visualizer**: Cross-section intersection engine slicing triangles at $0.12\text{mm} - 0.28\text{mm}$ layer heights, generating interactive G-code style horizontal toolpath lines.
- **Interactive Clipping Plane**: Real-time cross-section slicing along X, Y, or Z axes with solid interior reveals to inspect shell wall thickness.
- **Print Bed Envelopes**: Pre-calibrated bounding cages for Bambu Lab X1C ($256\times256\times256\text{ mm}$), Prusa MK4 ($250\times210\times220\text{ mm}$), and Voron 2.4 ($350\times350\times350\text{ mm}$).

### 3. 📐 Real Physical Analysis & Cost Estimator
- **Watertight Manifold Verification**: Topological edge parity checking ensuring closed 2-manifold surfaces.
- **Volume via Signed Tetrahedron Divergence Theorem**:
  $$V = \frac{1}{6} \sum_{i=1}^{N} \left( \mathbf{v}_1 \cdot (\mathbf{v}_2 \times \mathbf{v}_3) \right)$$
- **Filament Mass & Print Duration**: Estimates actual plastic consumption for PLA ($1.24\text{ g/cm}^3$), PETG ($1.27\text{ g/cm}^3$), ABS ($1.04\text{ g/cm}^3$), SLA Resin ($1.12\text{ g/cm}^3$), and TPU ($1.21\text{ g/cm}^3$) taking shell walls and internal infill percentages into account.

### 4. 💾 Valid Zero-Dependency Exporters
- **Binary STL**: Direct ArrayBuffer/DataView encoder with 80-byte header, uint32 triangle count, and Little-Endian float32 normals, coordinate-mapped ($Y\text{-up} \to Z\text{-up}$) for instant drag-and-drop into Bambu Studio, PrusaSlicer, and Cura.
- **ASCII STL**: Formatted facet text output for engineering analysis.
- **Wavefront OBJ**: Formatted polygonal mesh with vertex normals (`vn`) and UV coordinates (`vt`).
- **High-Res Snapshot PNG**: Transparent background render capture.
- **State Presets & JSON**: Save custom geometries to browser localStorage, mutate parameters with intelligent golden-ratio heuristics, and export/import configuration files.

### 5. 🔊 Tactile Web Audio Synthesizer
- Zero-asset audio engine generating real-time micro-frequency clicks on slider moves, latch tones on toggles, and multi-oscillator chords on file export.

---

## 🎨 Visual Design Philosophy (Frontend Design Skill)

To avoid predictable, template-heavy **"AI slop"** (purple gradients on white, floaty card kits, generic emojis, and uninspired layouts), Kinetic Forge 3D adheres to an **Aerospace Machining & Generative CAD** design language:
- **Palette**: Deep Carbon Void (`#0A0D12`), Anodized Slate Panel (`#12161F`), Machined Titanium Borders (`#232B38`), Luminescent Cyan Vector Accent (`#00F0FF`), and Cadmium Safety Amber (`#FF8400`).
- **Typography**: Clean `Inter` system UI paired with `JetBrains Mono` for all coordinate readouts, facet metrics, and dimensional telemetry.
- **Layout**: Immersive 3D viewport flanked by dual precision telemetry wings, persistent tactile segmented controls, and unobtrusive floating toolbars.

---

## 💼 Portfolio Case Study & Candidate Role (For Job Applications)

When presenting this project in a portfolio or technical interview, highlight the following engineering achievements:

### Resume Bullet Points
- **Built a Production-Ready 3D CAD Web Application**: Engineered a procedural geometry engine in React 19, TypeScript, and Three.js capable of synthesizing complex parametric meshes with sub-millisecond CPU rebuild times.
- **Authored Custom WebGL Shaders**: Developed GLSL vertex and fragment shaders computing surface normal slopes relative to gravity vectors to render real-time 3D printability overhang heatmaps.
- **Implemented Physical Calculus Algorithms**: Applied the Divergence Theorem via signed tetrahedron volume summation to compute exact manifold volumes ($cm^3$), surface areas, and filament masses for FDM and SLA resins.
- **Created a Native Slicing Simulator**: Developed a 3D triangle plane-intersection algorithm to generate toolpath contours across arbitrary layer heights ($0.12\text{mm} - 0.28\text{mm}$) directly in the browser.
- **Engineered Binary STL & OBJ Exporters**: Wrote low-level binary buffer encoders formatting watertight 3D geometries with proper Little-Endian byte alignment and $Z$-up coordinate remapping for slicers.

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/kinetic-forge-3d.git
cd kinetic-forge-3d

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
# Typecheck and compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License
Apache-2.0 © 2026 Kinetic Forge 3D
