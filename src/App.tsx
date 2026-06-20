import type { ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, CameraControls } from '@react-three/drei'
import { Aquarium } from './components/Aquarium'
import { Turtle } from './components/Turtle'
import { Spheres } from './components/Spheres'
import { SoftShadows } from './components/SoftShadows'
import { AquariumEnvironment } from './components/AquariumEnvironment'
import { CausticsFloor, GodRays, Particles } from './components/UnderwaterFX'
import type { AppProps } from './types'

export const App = ({ spheres }: AppProps): ReactElement => {
  return (
    <Canvas shadows camera={{ position: [30, 0, -3], fov: 35, near: 1, far: 50 }} gl={{ stencil: true }}>
      <color attach="background" args={['#5fa8b3']} />
      <fog attach="fog" args={['#3d7d85', 18, 45]} />
      {/** Sunlight piercing the water from above */}
      <spotLight position={[2, 22, 6]} angle={0.5} penumbra={1} intensity={3} color="#eaf6ff" castShadow />
      <ambientLight intensity={0.4} color="#9fd6e0" />
      {/** Glass aquarium */}
      <Aquarium position={[0, 0.25, 0]}>
        <Float rotationIntensity={2} floatIntensity={10} speed={2}>
          <Turtle position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
        </Float>
        <Spheres spheres={spheres} />
      </Aquarium>
      {/** Underwater atmosphere */}
      <GodRays count={7} />
      <CausticsFloor />
      <Particles count={200} />
      {/** Soft shadows */}
      <SoftShadows />
      {/** Custom environment map */}
      <AquariumEnvironment />
      <CameraControls truckSpeed={0} dollySpeed={0} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  )
}

export default App
