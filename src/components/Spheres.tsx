import type { ReactElement } from 'react'
import { Instances } from '@react-three/drei'
import type { SpheresProps } from '../types'
import { Sphere } from './Sphere'

export const Spheres = ({ spheres }: SpheresProps): ReactElement => {
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
