import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ReactElement, ReactNode } from 'react'
import { useMask, useGLTF, MeshTransmissionMaterial } from '@react-three/drei'
import type { AquariumProps } from '../types'
import shapesModel from '../assets/shapes-transformed.glb?url'

export const Aquarium = ({ children, ...props }: AquariumProps & { children?: ReactNode }): ReactElement => {
  const ref = useRef<THREE.Group>(null)
  const { nodes } = useGLTF(shapesModel)
  const stencil = useMask(1, false)
  const cubeGeometry = (nodes.Cube as THREE.Mesh).geometry

  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) Object.assign(child.material, stencil)
    })
  }, [stencil])

  return (
    <group {...props} dispose={null}>
      <mesh castShadow scale={[0.61 * 6, 0.8 * 6, 1 * 6]} geometry={cubeGeometry}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={1.4}
          roughness={0.02}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.04}
          distortionScale={0.1}
          temporalDistortion={0.08}
          attenuationColor="#9fdce8"
          attenuationDistance={18}
          iridescence={0.1}
          iridescenceIOR={1.2}
          iridescenceThicknessRange={[100, 400]}
        />
      </mesh>
      <group ref={ref}>{children}</group>
    </group>
  )
}

useGLTF.preload(shapesModel)
