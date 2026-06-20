import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { TurtleProps } from '../types'
import turtleModel from '../assets/model_52a_-_kemps_ridley_sea_turtle_no_id-transformed.glb?url'

/*
Author: DigitalLife3D (https://sketchfab.com/DigitalLife3D)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/model-52a-kemps-ridley-sea-turtle-no-id-7aba937dfbce480fb3aca47be3a9740b
Title: Model 52A - Kemps Ridley Sea Turtle (no ID)
*/
// Mutates three.js objects (scene rotation) returned from hooks — the idiomatic r3f pattern.
/* eslint-disable react-hooks/immutability */

export const Turtle = ({ reducedMotion = false, speed = 0.5, ...props }: TurtleProps): ReactElement => {
  const { scene, animations } = useGLTF(turtleModel)
  const { actions, mixer } = useAnimations(animations, scene)

  useEffect(() => {
    mixer.timeScale = reducedMotion ? 0 : speed
    actions['Swim Cycle']?.play()
  }, [actions, mixer, reducedMotion, speed])

  useFrame((state) => {
    if (reducedMotion) return
    scene.rotation.z = Math.sin(state.clock.elapsedTime / 4) / 2
  })

  return <primitive object={scene} {...props} />
}
