import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Continuous ascending bubble stream. Pooled, auto-spawns from the floor of
// the aquarium. Placed as a child of the aquarium group → local space.
/* eslint-disable react-hooks/immutability, react-hooks/purity */

const POOL = 60
const SPAWN_INTERVAL = 0.35
const RISE_SPEED = 1.4
const FLOOR_Y = -2.1
const CEILING_Y = 2.1

interface Bubble {
  active: boolean
  pos: THREE.Vector3
  vel: THREE.Vector3
  scale: number
  seed: number
}

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

export const Bubbles = (): ReactElement => {
  const groupRef = useRef<THREE.Group>(null)
  const timer = useRef(0)
  const cursor = useRef(0)
  const bubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: POOL }, () => ({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 1,
        seed: Math.random() * 100,
      })),
    [],
  )

  const spawn = (): void => {
    const i = cursor.current
    cursor.current = (cursor.current + 1) % POOL
    const b = bubbles[i]
    if (!b) return
    b.active = true
    b.pos.set(rand(-2.4, 2.4), FLOOR_Y + rand(0, 0.3), rand(-2.4, 2.4))
    b.vel.set(rand(-0.15, 0.15), RISE_SPEED * rand(0.7, 1.3), rand(-0.15, 0.15))
    b.scale = rand(0.05, 0.16)
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dt = Math.min(delta, 0.05)

    // Auto-spawn bubbles at a steady interval.
    timer.current += dt
    while (timer.current >= SPAWN_INTERVAL) {
      timer.current -= SPAWN_INTERVAL
      spawn()
    }

    groupRef.current.children.forEach((child, i) => {
      const b = bubbles[i]
      if (!b) return
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.Material & { opacity: number; transparent: boolean }
      if (b.active) {
        b.pos.addScaledVector(b.vel, dt)
        b.pos.x += Math.sin(b.seed + b.pos.y * 2) * 0.005
        b.pos.z += Math.cos(b.seed + b.pos.y * 1.5) * 0.005
        // Deactivate when the bubble reaches the water surface.
        if (b.pos.y >= CEILING_Y) {
          b.active = false
          mesh.visible = false
          return
        }
        const fade = Math.min(1, (CEILING_Y - b.pos.y) / 0.6)
        mesh.position.copy(b.pos)
        mesh.scale.setScalar(b.scale)
        mesh.visible = true
        mat.opacity = 0.85 * fade
      } else {
        mesh.visible = false
      }
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: POOL }, (_, i) => (
        <mesh key={i} visible={false}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial transparent opacity={0} color="#e8faff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
