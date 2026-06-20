import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// This component mutates a pooled bubble array in place — the idiomatic r3f
// pattern for high-frequency imperative updates that must not trigger React renders.
/* eslint-disable react-hooks/immutability */

const POOL_SIZE = 80
const BURST = 8
const RISE_SPEED = 2.5
const LIFE = 2.2

interface Bubble {
  active: boolean
  life: number
  pos: THREE.Vector3
  vel: THREE.Vector3
  scale: number
}

export const Bubbles = (): ReactElement => {
  const groupRef = useRef<THREE.Group>(null)
  const bubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: POOL_SIZE }, () => ({
        active: false,
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 1,
      })),
    [],
  )
  const cursor = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const spawnBurst = (point: THREE.Vector3): void => {
    for (let b = 0; b < BURST; b++) {
      const i = cursor.current
      cursor.current = (cursor.current + 1) % POOL_SIZE
      const bubble = bubbles[i]
      if (!bubble) continue
      bubble.active = true
      bubble.life = LIFE
      bubble.pos.copy(point)
      bubble.pos.x += (Math.random() - 0.5) * 1.5
      bubble.pos.z += (Math.random() - 0.5) * 1.5
      bubble.vel.set((Math.random() - 0.5) * 0.6, RISE_SPEED * (0.7 + Math.random() * 0.6), (Math.random() - 0.5) * 0.6)
      bubble.scale = 0.1 + Math.random() * 0.18
    }
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dt = Math.min(delta, 0.05)
    groupRef.current.children.forEach((child, i) => {
      const bubble = bubbles[i]
      if (!bubble) return
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.Material & { opacity: number; transparent: boolean }
      if (bubble.active) {
        bubble.life -= dt
        if (bubble.life <= 0) {
          bubble.active = false
          mesh.visible = false
          return
        }
        bubble.pos.addScaledVector(bubble.vel, dt)
        bubble.vel.x *= 0.96
        bubble.vel.z *= 0.96
        const t = bubble.life / LIFE
        dummy.position.copy(bubble.pos)
        dummy.scale.setScalar(bubble.scale * (0.5 + 0.5 * t))
        dummy.updateMatrix()
        mesh.visible = true
        mesh.matrix.copy(dummy.matrix)
        mat.opacity = t * 0.7
      } else {
        mesh.visible = false
      }
    })
  })

  return (
    <>
      {/* Invisible backplane that captures clicks and spawns bubbles at the hit point. */}
      <mesh
        position={[0, 0, -12]}
        onPointerDown={(e) => {
          e.stopPropagation()
          spawnBurst(e.point)
        }}
      >
        <planeGeometry args={[120, 80]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={groupRef}>
        {Array.from({ length: POOL_SIZE }, (_, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              transparent
              opacity={0}
              color="#cdf3ff"
              emissive="#aee9ff"
              emissiveIntensity={0.4}
              roughness={0.1}
              metalness={0}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}
