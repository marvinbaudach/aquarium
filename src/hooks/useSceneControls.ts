import { useCallback, useEffect, useMemo, useState } from 'react'

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

interface SceneState {
  turtleSpeed: number
  sphereCount: number
  isNight: boolean
  bloomIntensity: number
}

const DEFAULTS: SceneState = {
  turtleSpeed: 0.5,
  sphereCount: 12,
  isNight: false,
  bloomIntensity: 0.6
}

const STORAGE_KEY = 'aquarium:controls'

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

// Resolve initial state: URL query params win (shareable links), then
// localStorage (returning visitor), then defaults. Every value is validated and
// clamped so a hand-edited URL can't push the scene into an invalid state.
const readInitialState = (): SceneState => {
  if (typeof window === 'undefined') return DEFAULTS

  const stored = ((): Partial<SceneState> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Partial<SceneState>) : {}
    } catch {
      return {}
    }
  })()

  const params = new URLSearchParams(window.location.search)
  const num = (key: string, fallback: number): number => {
    const parsed = Number(params.get(key))
    return params.has(key) && !Number.isNaN(parsed) ? parsed : fallback
  }

  return {
    turtleSpeed: clamp(num('turtle', stored.turtleSpeed ?? DEFAULTS.turtleSpeed), 0, 1),
    sphereCount: clamp(Math.round(num('spheres', stored.sphereCount ?? DEFAULTS.sphereCount)), 0, 12),
    isNight: params.has('night') ? params.get('night') === '1' : (stored.isNight ?? DEFAULTS.isNight),
    bloomIntensity: clamp(num('bloom', stored.bloomIntensity ?? DEFAULTS.bloomIntensity), 0, 2)
  }
}

const persist = (state: SceneState): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode / quota) — URL still carries state.
  }
  const params = new URLSearchParams()
  params.set('turtle', state.turtleSpeed.toFixed(2))
  params.set('spheres', String(state.sphereCount))
  params.set('bloom', state.bloomIntensity.toFixed(2))
  params.set('night', state.isNight ? '1' : '0')
  const url = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState(null, '', url)
}

export const useSceneControls = (): SceneControls => {
  const [state, setState] = useState<SceneState>(readInitialState)

  useEffect(() => {
    persist(state)
  }, [state])

  // Stable setter identities (functional updates → no deps) so consumers can be
  // safely memoized and effect/callback deps don't churn on every render.
  const setTurtleSpeed = useCallback((turtleSpeed: number) => {
    setState((s) => ({ ...s, turtleSpeed }))
  }, [])
  const setSphereCount = useCallback((sphereCount: number) => {
    setState((s) => ({ ...s, sphereCount }))
  }, [])
  const setIsNight = useCallback((isNight: boolean) => {
    setState((s) => ({ ...s, isNight }))
  }, [])
  const setBloomIntensity = useCallback((bloomIntensity: number) => {
    setState((s) => ({ ...s, bloomIntensity }))
  }, [])

  return useMemo(
    () => ({
      turtleSpeed: state.turtleSpeed,
      setTurtleSpeed,
      sphereCount: state.sphereCount,
      setSphereCount,
      isNight: state.isNight,
      setIsNight,
      bloomIntensity: state.bloomIntensity,
      setBloomIntensity
    }),
    [state, setTurtleSpeed, setSphereCount, setIsNight, setBloomIntensity]
  )
}
