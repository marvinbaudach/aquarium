import type { CSSProperties, ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, CameraControls, PerformanceMonitor } from '@react-three/drei'
import { Aquarium } from './components/Aquarium'
import { Turtle } from './components/Turtle'
import { Spheres } from './components/Spheres'
import { SoftShadows } from './components/SoftShadows'
import { AquariumEnvironment } from './components/AquariumEnvironment'
import { PostProcessing } from './components/PostProcessing'
import { MouseParallax } from './components/MouseParallax'
import { ControlDock } from './components/ControlDock'
import { useAdaptiveQuality } from './hooks/useAdaptiveQuality'
import { useSceneControls } from './hooks/useSceneControls'
import type { AppProps } from './types'

const wrapperStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
}

export const App = ({ spheres }: AppProps): ReactElement => {
  const { isMobile, reducedMotion, dpr, setDpr } = useAdaptiveQuality()
  const controls = useSceneControls()
  const { turtleSpeed, sphereCount, isNight, bloomIntensity } = controls

  const bgColor = isNight ? '#0a2030' : '#2c5f6e'
  const visibleSpheres = spheres.slice(0, sphereCount)

  return (
    <div style={wrapperStyle}>
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [30, 0, -3], fov: 35, near: 1, far: 50 }}
        gl={{ stencil: true, antialias: !isMobile }}
      >
        <PerformanceMonitor
          onDecline={() => { setDpr(Math.max(0.5, dpr - 0.25)) }}
          onIncline={() => { setDpr(Math.min(isMobile ? 1.5 : 2, dpr + 0.25)) }}
        />
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 20, 48]} />
        {/** Static light sources piercing the water from above */}
        <spotLight
          position={[0, 22, 0]}
          angle={0.5}
          penumbra={1}
          intensity={isNight ? 1.2 : 3}
          color={isNight ? '#9fc8ff' : '#fff4d6'}
          castShadow
        />
        <ambientLight intensity={isNight ? 0.15 : 0.35} color={isNight ? '#2a4a6a' : '#6fa8b8'} />
        <hemisphereLight args={[isNight ? '#1a2a40' : '#bfe3ec', '#1a3d45', isNight ? 0.3 : 0.6]} />
        {/** Scene contents with subtle mouse-driven parallax */}
        <MouseParallax intensity={0.06}>
          {/** Glass aquarium */}
          <Aquarium position={[0, 0.25, 0]}>
            {reducedMotion ? (
              <Turtle reducedMotion speed={turtleSpeed} position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
            ) : (
              <Float rotationIntensity={2} floatIntensity={10} speed={2}>
                <Turtle speed={turtleSpeed} position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
              </Float>
            )}
            <Spheres spheres={visibleSpheres} />
          </Aquarium>
          {/** Soft shadows */}
          <SoftShadows />
        </MouseParallax>
        {/** Custom environment map */}
        <AquariumEnvironment />
        {/** Cinematic post: Bloom driven by dock slider. */}
        <PostProcessing bloomIntensity={bloomIntensity} />
        <CameraControls truckSpeed={0} dollySpeed={0} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Canvas>
      <ControlDock controls={controls} />
    </div>
  )
}

export default App
