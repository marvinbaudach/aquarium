import type { ThreeElements } from '@react-three/fiber'
import type { ReactNode } from 'react'

export type Vec3 = [number, number, number]

export type SphereData = readonly [scale: number, color: string, speed: number, position: Vec3]

export type AquariumProps = ThreeElements['group']

export type SphereProps = {
  position?: Vec3
  scale?: number
  speed?: number
  color?: string
}

export type TurtleProps = {
  position?: Vec3
  rotation?: Vec3
  scale?: number
}

export type SpheresProps = {
  spheres: SphereData[]
}

export type AppProps = {
  spheres: SphereData[]
  children?: ReactNode
}
