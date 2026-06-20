import { Instances } from '@react-three/drei'
import type { SphereData } from '../types'
import { Sphere } from './Sphere'

type SpheresProps = {
  spheres: SphereData[]
}

export const Spheres = ({ spheres }: SpheresProps) => {
  return (
    <Instances renderOrder={-1000}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial depthTest={false} />
      {spheres.map(([scale, color, speed, position], index) => (
        <Sphere key={index} scale={scale} color={color} speed={speed} position={position} />
      ))}
    </Instances>
  )
}
