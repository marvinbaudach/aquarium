import type { ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, CameraControls } from '@react-three/drei'
import { Aquarium } from './components/Aquarium'
import { Turtle } from './components/Turtle'
import { Spheres } from './components/Spheres'
import { SoftShadows } from './components/SoftShadows'
import { AquariumEnvironment } from './components/AquariumEnvironment'
import type { AppProps } from './types'

export const App = ({ spheres }: AppProps): ReactElement => {
  return (
    <Canvas shadows camera={{ position: [30, 0, -3], fov: 35, near: 1, far: 50 }} gl={{ stencil: true }}>
      <color attach="background" args={['#2c5f6e']} />
      <fog attach="fog" args={['#2c5f6e', 20, 48]} />
      {/** Static light sources piercing the water from above */}
      <spotLight position={[0, 22, 0]} angle={0.5} penumbra={1} intensity={3} color="#fff4d6" castShadow />
      <ambientLight intensity={0.35} color="#6fa8b8" />
      <hemisphereLight args={['#bfe3ec', '#1a3d45', 0.6]} />
      {/** Glass aquarium */}
      <Aquarium position={[0, 0.25, 0]}>
        <Float rotationIntensity={2} floatIntensity={10} speed={2}>
          <Turtle position={[0, -0.5, -1]} rotation={[0, Math.PI, 0]} scale={23} />
        </Float>
        <Spheres spheres={spheres} />
      </Aquarium>
      {/** Soft shadows */}
      <SoftShadows />
      {/** Custom environment map */}
      <AquariumEnvironment />
      <CameraControls truckSpeed={0} dollySpeed={0} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  )
}

export default App
