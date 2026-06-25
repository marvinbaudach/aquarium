import { memo, useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// A loose school of small fish circling inside the tank. Built procedurally
// (no external model → zero licensing) from a body + tail per fish, oriented
// along travel with a gentle bank. Placed as a child of the aquarium group, so
// it inherits the glass stencil mask like the rest of the contents.

const COUNT = 16
const COLORS = ['#d7e2e6', '#ffd27f', '#7fd4e6', '#f4946b', '#bfe3a0']
const RATIO = 1.7 // z-radius vs x-radius, keeps orbits inside the rectangular tank

interface Fish {
  radius: number
  speed: number
  phase: number
  yBase: number
  bob: number
  color: string
  scale: number
}

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

// Memoized: prop-less and self-animating via useFrame, so it should not
// re-reconcile its 16-fish subtree when the parent re-renders.
export const FishSchool = memo(function FishSchool(): ReactElement {
  const refs = useRef<(THREE.Group | null)[]>([])
  const fish = useMemo<Fish[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        radius: rand(0.6, 1.5),
        speed: rand(0.25, 0.5) * (Math.random() < 0.5 ? -1 : 1),
        phase: rand(0, Math.PI * 2),
        // Bias the school into the upper band, above the (large, central)
        // turtle, so the fish don't swim through it.
        yBase: rand(1.2, 1.85),
        bob: rand(0.08, 0.2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#d7e2e6',
        scale: rand(0.11, 0.2)
      })),
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    fish.forEach((f, i) => {
      const g = refs.current[i]
      if (!g) return
      const a = f.phase + t * f.speed
      const x = Math.cos(a) * f.radius
      const z = Math.sin(a) * f.radius * RATIO
      const y = f.yBase + Math.sin(t * 0.6 + f.phase) * f.bob
      // A small step further along the orbit gives the heading to face.
      const a2 = a + 0.08 * Math.sign(f.speed)
      const x2 = Math.cos(a2) * f.radius
      const z2 = Math.sin(a2) * f.radius * RATIO
      g.position.set(x, y, z)
      g.rotation.set(0, Math.atan2(x2 - x, z2 - z), 0)
      g.rotateZ(Math.sin(t * 3 + f.phase) * 0.12)
    })
  })

  return (
    <group>
      {fish.map((f, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          scale={f.scale}
        >
          {/* Body — elongated along +Z (forward). */}
          <mesh scale={[0.55, 0.75, 1.5]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.45} metalness={0.15} />
          </mesh>
          {/* Tail fin at the back. */}
          <mesh position={[0, 0, -1.7]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]}>
            <coneGeometry args={[0.55, 0.9, 6]} />
            <meshStandardMaterial color={f.color} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
})
