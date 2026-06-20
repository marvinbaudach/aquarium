import { useLayoutEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useMask, useGLTF, MeshTransmissionMaterial } from '@react-three/drei'
import type { PropsWithChildren } from 'react'
import type { AquariumProps } from '../types'
import shapesModel from '../assets/shapes-transformed.glb?url'

export const Aquarium = ({ children, ...props }: PropsWithChildren<AquariumProps>) => {
  const ref = useRef<THREE.Group>(null)
  const { nodes } = useGLTF(shapesModel)
  const stencil = useMask(1, false)

  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.material) Object.assign(mesh.material, { ...stencil })
    })
  }, [])

  return (
    <group {...props} dispose={null}>
      <mesh castShadow scale={[0.61 * 6, 0.8 * 6, 1 * 6]} geometry={(nodes.Cube as THREE.Mesh).geometry}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={3}
          chromaticAberration={0.025}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.2}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
        />
      </mesh>
      <group ref={ref}>{children}</group>
    </group>
  )
}
