# Aquarium

Interactive 3D aquarium — a rigged sea turtle and a fish school swim inside a
transmissive glass cube. Tune it live, share the scene by URL, and the renderer
adapts its quality to your GPU in real time.

**Live → [marvinbaudach.github.io/aquarium](https://marvinbaudach.github.io/aquarium/)**

![Aquarium scene](./public/og.png)

## Tech

- React Three Fiber 9 · Three.js 0.184 · drei 10 · postprocessing
- Vite 8 · React 19 · TypeScript 6 (strict, type-aware ESLint)
- Vitest + Testing Library · GitHub Pages via Actions

## Highlights

- Glass cube via `MeshTransmissionMaterial`; contents stencil-masked to the tank
- Live fps-adaptive quality ladder (DPR + effects step up/down against the frame budget)
- State serialized to the URL + `localStorage` — every config is a shareable link
- Stats overlay (FPS/DPR/tris/draw calls) fed by a ref, zero scene re-renders
- `prefers-reduced-motion` aware · WebGL2 error boundary

## Develop

```bash
npm install
npm run dev      # localhost:5173
npm run build    # type-checked production build
npm test         # Vitest
```
