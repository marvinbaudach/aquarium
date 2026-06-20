import { useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface MouseParallaxProps {
  /** Max rotation in radians applied to the wrapped group. */
  intensity?: number
  children: ReactNode
}

export const MouseParallax = ({ intensity = 0.08, children }: MouseParallaxProps): ReactElement => {
  const ref = useRef<THREE.Group>(null)
  const target = useRef(new THREE.Vector2())
  const current = useRef(new THREE.Vector2())
  const { pointer } = useThree()

  useFrame((_, delta) => {
    target.current.set(pointer.y * intensity, pointer.x * intensity)
    const lerp = Math.min(delta * 2.5, 1)
    current.current.x += (target.current.x - current.current.x) * lerp
    current.current.y += (target.current.y - current.current.y) * lerp
    if (ref.current) {
      ref.current.rotation.x = current.current.x
      ref.current.rotation.y = current.current.y
    }
  })

  return <group ref={ref}>{children}</group>
}
