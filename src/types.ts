import type { ThreeElements } from '@react-three/fiber'
import type { ReactNode } from 'react'

export type Vec3 = [number, number, number]

export type SphereData = readonly [scale: number, color: string, speed: number, position: Vec3]

export type AquariumProps = ThreeElements['group']

export interface SphereProps {
  position?: Vec3
  scale?: number
  speed?: number
  color?: string
}

export interface TurtleProps {
  position?: Vec3
  rotation?: Vec3
  scale?: number
  /** When true, disables the idle roll animation (prefers-reduced-motion). */
  reducedMotion?: boolean
}

export interface SpheresProps {
  spheres: SphereData[]
}

export interface AppProps {
  spheres: SphereData[]
  children?: ReactNode
}
