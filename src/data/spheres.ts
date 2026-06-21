import type { SphereData } from '../types'

// Floating spheres inside the tank, ordered so the ControlDock's "Spheres"
// slider reveals them progressively (slice(0, count)). Each entry is
// [scale, color, floatSpeed, position]. Kept as named data rather than inline
// in the entry point so the scene composition lives in one reviewable place.
export const SPHERES: readonly SphereData[] = [
  [1, 'orange', 0.05, [-4, -1, -1]],
  [0.75, 'hotpink', 0.1, [-4, 2, -2]],
  [1.25, 'aquamarine', 0.2, [4, -3, 2]],
  [1.5, 'lightblue', 0.3, [-4, -2, -3]],
  [2, 'pink', 0.3, [-3, 2, -4]],
  [2, 'skyblue', 0.3, [3, 2, 4]],
  [1.5, 'orange', 0.05, [4, -1, 1]],
  [2, 'hotpink', 0.1, [-3, 2, 2]],
  [1.5, 'aquamarine', 0.2, [4, 3, -2]],
  [1.25, 'lightblue', 0.3, [-2, -2, 3]],
  [1, 'pink', 0.3, [2, 3, -4]],
  [1, 'skyblue', 0.3, [-4, 1, 4]]
]
