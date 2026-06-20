# Aquarium

**Live demo → [marvinbaudach.github.io/aquarium](https://marvinbaudach.github.io/aquarium/)**

An interactive 3D aquarium scene built with React Three Fiber. A Kemp's Ridley sea turtle swims inside a glass cube, surrounded by a dozen floating colored spheres. A faithful, modern-stack port of the [pmndrs aquarium demo](https://pmndrs.github.io/examples/demos/aquarium) — drag to orbit the tank.

## Interaction

| Input | Effect |
|---|---|
| Drag | Orbit around the aquarium |
| Scroll / pinch | (locked) trucking & dollying are disabled in the original |
| Auto | Turtle swims its `Swim Cycle` animation; spheres drift via `Float` |

## Features

- **Glass cube aquarium** — a single mesh rendered with `MeshTransmissionMaterial`: transmission, chromatic aberration, anisotropy, distortion and iridescence, with the `backside` pass so the turtle reads through both panes
- **Stencil-masked contents** — everything inside the cube (`useMask`) is clipped to the glass volume so spheres and turtle stay within the tank
- **Animated sea turtle** — a rigged Kemp's Ridley GLB (SkinnedMesh) playing its `Swim Cycle`, slowed to `timeScale 0.5`, with a gentle sinusoidal roll on `rotation.z`
- **Floating spheres** — twelve instanced colored spheres (`Instances`/`Instance`) each wrapped in `Float` with per-sphere speed, scale and color
- **Soft shadows** — `AccumulativeShadows` with a `RandomizedLight` accumulating 100 temporal frames for a noise-free shadow under the tank
- **Custom environment** — a hand-built `Environment` of `Lightformer` strips and circles baked into a 1024px cubemap for glass reflections
- **Camera controls** — `CameraControls` with trucking/dollying locked and polar angle clamped to the upper hemisphere

## Tech

| | |
|---|---|
| Renderer | React Three Fiber 9 + Three.js 0.184 |
| Helpers | @react-three/drei 10 (MeshTransmissionMaterial, useMask, Float, Instances, AccumulativeShadows, Environment, Lightformer, CameraControls, useGLTF, useAnimations) |
| Framework | Vite 8 + React 19 |
| Language | TypeScript 6 |
| Hosting | GitHub Pages via GitHub Actions |

## Local Development

```bash
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173).

## Build

```bash
npm run build        # type-checked production build (tsc --noEmit && vite build)
npm run preview      # serve the production build locally
```

## Project Structure

```
src/
├── index.tsx               # mount + overlay (Logo, "ok —", date) + sphere data
├── App.tsx                 # Canvas + composition of all components
├── types.ts                # shared prop types (SphereData, Aquarium/Turtle/Sphere props)
├── components/
│   ├── Aquarium.tsx        # glass cube (MeshTransmissionMaterial) + stencil-masked contents
│   ├── Turtle.tsx          # rigged turtle GLB, Swim Cycle animation + roll
│   ├── Sphere.tsx          # single instanced sphere wrapped in Float
│   ├── Spheres.tsx         # Instances container mapping the sphere data
│   ├── SoftShadows.tsx     # AccumulativeShadows + RandomizedLight
│   └── AquariumEnvironment.tsx  # Lightformer-based Environment cubemap
├── styles.css              # reset, Inter font, canvas fade-in
├── vite-env.d.ts
└── assets/
    ├── shapes-transformed.glb  # glass-cube mesh
    └── model_52a_-_kemps_ridley_sea_turtle_no_id-transformed.glb  # rigged turtle
```

## Credits

Turtle model — **Model 52A - Kemps Ridley Sea Turtle (no ID)** by
[DigitalLife3D](https://sketchfab.com/DigitalLife3D), licensed under
[CC-BY-NC-4.0](http://creativecommons.org/licenses/by-nc/4.0/).
[Source on Sketchfab](https://sketchfab.com/3d-models/model-52a-kemps-ridley-sea-turtle-no-id-7aba937dfbce480fb3aca47be3a9740b).

Original demo by the [pmndrs](https://pmnd.rs/) collective
([source](https://github.com/pmndrs/examples/tree/main/demos/aquarium)).
