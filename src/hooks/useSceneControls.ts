import { useState } from 'react'

export interface SceneControls {
  /** Turtle swim-cycle timeScale (0 = frozen, 1 = full speed). */
  turtleSpeed: number
  setTurtleSpeed: (v: number) => void
  /** Number of floating spheres (0–12). */
  sphereCount: number
  setSphereCount: (v: number) => void
  /** Night lighting mode (darker, cooler). */
  isNight: boolean
  setIsNight: (v: boolean) => void
  /** Bloom intensity multiplier. */
  bloomIntensity: number
  setBloomIntensity: (v: number) => void
}

export const useSceneControls = (): SceneControls => {
  const [turtleSpeed, setTurtleSpeed] = useState(0.5)
  const [sphereCount, setSphereCount] = useState(12)
  const [isNight, setIsNight] = useState(false)
  const [bloomIntensity, setBloomIntensity] = useState(0.6)

  return {
    turtleSpeed,
    setTurtleSpeed,
    sphereCount,
    setSphereCount,
    isNight,
    setIsNight,
    bloomIntensity,
    setBloomIntensity,
  }
}
