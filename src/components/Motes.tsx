import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Slow suspended particles drifting inside the tank — the marine-snow that
// sells "this is water". A single managed InstancedMesh (a Mesh, so it picks up
// the aquarium's stencil mask) updated per frame. Cheap: matrix writes only.

const COUNT = 90
const BOUND = 2.3
const dummy = new THREE.Object3D()

interface Mote {
  base: THREE.Vector3
  drift: THREE.Vector3
  phase: number
  scale: number
}

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

export const Motes = (): ReactElement => {
  const ref = useRef<THREE.InstancedMesh>(null)
  const motes = useMemo<Mote[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        base: new THREE.Vector3(rand(-BOUND, BOUND), rand(-BOUND, BOUND), rand(-BOUND, BOUND)),
        drift: new THREE.Vector3(rand(-0.04, 0.04), rand(0.02, 0.08), rand(-0.04, 0.04)),
        phase: rand(0, Math.PI * 2),
        scale: rand(0.012, 0.04)
      })),
    []
  )

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    motes.forEach((m, i) => {
      const x = m.base.x + Math.sin(t * 0.3 + m.phase) * 0.25
      const y = ((m.base.y + t * m.drift.y) % (BOUND * 2)) - BOUND
      const z = m.base.z + Math.cos(t * 0.25 + m.phase) * 0.25
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(m.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#cfeefa" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
    </instancedMesh>
  )
}
