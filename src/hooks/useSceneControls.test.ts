import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSceneControls } from './useSceneControls'

const setSearch = (search: string): void => {
  window.history.replaceState(null, '', search)
}

describe('useSceneControls', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setSearch('/')
  })

  it('hydrates from URL query params and clamps out-of-range values', () => {
    setSearch('/?turtle=0.20&spheres=3&bloom=1.50&night=1')
    const { result } = renderHook(() => useSceneControls())

    expect(result.current.turtleSpeed).toBe(0.2)
    expect(result.current.sphereCount).toBe(3)
    expect(result.current.bloomIntensity).toBe(1.5)
    expect(result.current.isNight).toBe(true)
  })

  it('clamps a hand-edited out-of-range URL', () => {
    setSearch('/?spheres=999&turtle=-5')
    const { result } = renderHook(() => useSceneControls())

    expect(result.current.sphereCount).toBe(12)
    expect(result.current.turtleSpeed).toBe(0)
  })

  it('falls back to localStorage when no URL params are present', () => {
    window.localStorage.setItem('aquarium:controls', JSON.stringify({ turtleSpeed: 0.9, sphereCount: 2, isNight: true, bloomIntensity: 0.1 }))
    const { result } = renderHook(() => useSceneControls())

    expect(result.current.turtleSpeed).toBe(0.9)
    expect(result.current.sphereCount).toBe(2)
    expect(result.current.isNight).toBe(true)
  })

  it('persists changes to both localStorage and the URL', () => {
    const { result } = renderHook(() => useSceneControls())

    act(() => {
      result.current.setTurtleSpeed(0.8)
    })

    const stored = window.localStorage.getItem('aquarium:controls')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored ?? '{}') as { turtleSpeed: number }
    expect(parsed.turtleSpeed).toBe(0.8)
    expect(window.location.search).toContain('turtle=0.80')
  })
})
