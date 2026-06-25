import type { ReactElement } from 'react'
import { Instances } from '@react-three/drei'
import type { SpheresProps } from '../types'
import { Sphere } from './Sphere'

export const Spheres = ({ spheres }: SpheresProps): ReactElement => {
  return (
    <Instances renderOrder={-1000}>
      {/* 32 segments is visually identical for these smooth, unlit background
          spheres but quarters the triangle count vs 64 (8k → 2k per instance). */}
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial depthTest={false} />
      {spheres.map(([scale, color, speed, position], index) => (
        <Sphere key={index} scale={scale} color={color} speed={speed} position={position} />
      ))}
    </Instances>
  )
}
