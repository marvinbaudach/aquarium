import { Suspense, useEffect, useRef } from 'react'
import type { ComponentRef, CSSProperties, ReactElement } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Float, CameraControls, PerformanceMonitor } from '@react-three/drei'
import { Aquarium } from './components/Aquarium'
import { Turtle } from './components/Turtle'
import { Spheres } from './components/Spheres'
import { SoftShadows } from './components/SoftShadows'
import { AquariumEnvironment } from './components/AquariumEnvironment'
import { PostProcessing } from './components/PostProcessing'
import { MouseParallax } from './components/MouseParallax'
import { Bubbles } from './components/Bubbles'
import { FishSchool } from './components/FishSchool'
import { Motes } from './components/Motes'
import { Caustics } from './components/Caustics'
import { SeaBackground } from './components/SeaBackground'
import { ControlDock } from './components/ControlDock'
import { SceneLoader } from './components/SceneLoader'
import { StatsOverlay, StatsBridge } from './components/StatsOverlay'
import type { RenderStats } from './components/StatsOverlay'
import { WebGLErrorBoundary, WebGLUnavailable, isWebGLAvailable } from './components/WebGLErrorBoundary'
import { useAdaptiveQuality } from './hooks/useAdaptiveQuality'
import { useSceneControls } from './hooks/useSceneControls'
import type { AppProps } from './types'

const wrapperStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%'
}

export const App = ({ spheres }: AppProps): ReactElement => {
  const { isMobile, reducedMotion, dpr, setDpr } = useAdaptiveQuality()
  const controls = useSceneControls()
  const statsRef = useRef<RenderStats>({ triangles: 0, calls: 0 })
  const cameraRef = useRef<ComponentRef<typeof CameraControls>>(null)

  // Cinematic entrance: snap to a wide, high vantage then ease into the resting
  // framing. Skipped entirely under prefers-reduced-motion. The resting distance
  // is aspect-aware: on a narrow portrait viewport (phones) the fixed vertical
  // FOV leaves the wide tank — and the turtle — filling only a thin strip, so we
  // dolly in. Landscape/desktop keeps the original 30-unit framing.
  useEffect(() => {
    const cam = cameraRef.current
    if (!cam) return

    const restingLookAt = (): [number, number, number] => {
      const aspect = window.innerWidth / window.innerHeight
      // Portrait shrinks horizontal coverage; pull the camera closer so the
      // turtle reads without manual zoom. Clamp to CameraControls' minDistance.
      const distance = aspect < 1 ? THREE.MathUtils.lerp(16, 30, aspect) : 30
      const dir = new THREE.Vector3(30, 0, -3).normalize().multiplyScalar(distance)
      return [dir.x, dir.y, dir.z]
    }

    const [x, y, z] = restingLookAt()
    if (reducedMotion) {
      void cam.setLookAt(x, y, z, 0, 0, 0, false)
      return
    }
    void cam.setLookAt(46, 22, -26, 0, 0, 0, false)
    void cam.setLookAt(x, y, z, 0, 0, 0, true)

    // Re-frame on orientation change so rotating the device keeps the turtle
    // well-sized.
    const onResize = (): void => {
      const [nx, ny, nz] = restingLookAt()
      void cam.setLookAt(nx, ny, nz, 0, 0, 0, true)
    }
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('orientationchange', onResize)
    }
  }, [reducedMotion])
  const { turtleSpeed, sphereCount, isNight, bloomIntensity } = controls

  const bgColor = isNight ? '#0a2030' : '#2c5f6e'
  const visibleSpheres = spheres.slice(0, sphereCount)

  if (!isWebGLAvailable()) {
    return (
      <div style={wrapperStyle}>
        <WebGLUnavailable />
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <WebGLErrorBoundary>
        <Canvas
          shadows={!isMobile}
          dpr={dpr}
          camera={{ position: [30, 0, -3], fov: 35, near: 1, far: 120 }}
          gl={{ stencil: true, antialias: !isMobile }}
          aria-label="Interactive 3D aquarium: a sea turtle swims inside a glass cube surrounded by floating spheres. Drag to orbit."
          role="img"
        >
          <Suspense fallback={null}>
            <PerformanceMonitor
              onDecline={() => {
                setDpr(Math.max(0.5, dpr - 0.25))
              }}
              onIncline={() => {
                setDpr(Math.min(isMobile ? 1.5 : 2, dpr + 0.25))
              }}
            />
            <StatsBridge statsRef={statsRef} />
            <color attach="background" args={[bgColor]} />
            <fog attach="fog" args={[bgColor, 20, 60]} />
            <SeaBackground isNight={isNight} />
            {/** Static light sources piercing the water from above */}
            <spotLight
              position={[0, 22, 0]}
              angle={0.5}
              penumbra={1}
              intensity={isNight ? 0.7 : 1.6}
              color={isNight ? '#9fc8ff' : '#fff4d6'}
              castShadow={!isMobile}
            />
            <ambientLight intensity={isNight ? 0.4 : 0.75} color={isNight ? '#2a4a6a' : '#9fc8d6'} />
            <hemisphereLight args={[isNight ? '#1a2a40' : '#cdeef7', '#244a52', isNight ? 0.45 : 1.0]} />
            {/** Fill light from the camera side so the turtle reads through the glass */}
            <directionalLight position={[26, 5, -3]} intensity={isNight ? 0.6 : 1.5} color="#dff2ff" />
            {/** Dedicated front key aimed at the turtle so its shell detail reads through the glass without zooming in */}
            <spotLight
              position={[24, 8, -3]}
              angle={0.7}
              penumbra={0.8}
              distance={90}
              intensity={isNight ? 1.0 : 2.4}
              color={isNight ? '#bcd8ff' : '#ffffff'}
            />
            {/** Scene contents with subtle mouse-driven parallax */}
            <MouseParallax intensity={0.018}>
              {/** Glass aquarium — contents are stencil-masked to the glass volume */}
              <Aquarium position={[0, 0.25, 0]}>
                {/** Turtle with swim cycle */}
                {reducedMotion ? (
                  <Turtle reducedMotion speed={turtleSpeed} position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
                ) : (
                  <Float rotationIntensity={2} floatIntensity={3} speed={2}>
                    <Turtle speed={turtleSpeed} position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
                  </Float>
                )}
                {/** Floating spheres, fish school and bubble stream are all
                    skipped in the low-power path — extra draw calls and
                    per-frame pool updates that phones don't need. */}
                {!isMobile && <Spheres spheres={visibleSpheres} />}
                {!isMobile && <FishSchool />}
                {!isMobile && <Bubbles />}
                {/** Suspended drifting particles (marine snow) — skipped in the
                    low-power path to free per-frame budget on phones. */}
                {!isMobile && <Motes />}
              </Aquarium>
              {/** Soft shadows accumulate 100 frames from 8 light samples — a
                  startup spike that stutters low-power GPUs, so skip on mobile. */}
              {!isMobile && <SoftShadows />}
              {/** Animated caustics on the seabed under the tank */}
              {!isMobile && <Caustics />}
            </MouseParallax>
            {/** Custom environment map */}
            <AquariumEnvironment />
            {/** Cinematic post: full-screen multi-pass composer (Bloom + SMAA +
                Vignette) is the single biggest GPU cost — drop it on low-power
                devices so the scene stays smooth. */}
            {!isMobile && <PostProcessing bloomIntensity={bloomIntensity} />}
            <CameraControls ref={cameraRef} truckSpeed={0} dollySpeed={1} minDistance={14} maxDistance={34} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
      <SceneLoader />
      <StatsOverlay statsRef={statsRef} dpr={dpr} />
      <ControlDock controls={controls} isMobile={isMobile} />
    </div>
  )
}

export default App
