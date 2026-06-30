import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdaptiveQuality, QUALITY_TIERS } from './useAdaptiveQuality'

type Matcher = (query: string) => boolean

// Minimal matchMedia stub: a single predicate decides which queries match.
const stubMatchMedia = (matches: Matcher): void => {
  const impl = (query: string): MediaQueryList => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true)
  })
  vi.stubGlobal('matchMedia', vi.fn(impl))
}

describe('useAdaptiveQuality', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('low-power detection', () => {
    it('flags a touch-primary device with no fine pointer as low power', () => {
      stubMatchMedia((q) => q.includes('pointer: coarse'))
      const { result } = renderHook(() => useAdaptiveQuality())

      expect(result.current.isMobile).toBe(true)
      // Mobile starts mid-ladder (rung 3) — optimistic but below the top.
      expect(result.current.level).toBe(3)
      expect(result.current.tier.dpr).toBe(1.5)
    })

    it('does not flag a desktop with a fine pointer', () => {
      stubMatchMedia((q) => q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      expect(result.current.isMobile).toBe(false)
      // Desktop starts one rung higher (rung 4).
      expect(result.current.level).toBe(4)
      expect(result.current.tier.dpr).toBe(1.75)
    })

    it('does not flag a touchscreen laptop (coarse + fine both present)', () => {
      stubMatchMedia((q) => q.includes('pointer: coarse') || q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      expect(result.current.isMobile).toBe(false)
    })
  })

  describe('quality ladder', () => {
    it('steps down on decline and back up on incline', () => {
      stubMatchMedia((q) => q.includes('any-pointer: fine')) // desktop, starts at 4
      const { result } = renderHook(() => useAdaptiveQuality())

      act(() => {
        result.current.decline()
      })
      expect(result.current.level).toBe(3)

      act(() => {
        result.current.incline()
      })
      expect(result.current.level).toBe(4)
    })

    it('never declines below the lowest rung', () => {
      stubMatchMedia((q) => q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      act(() => {
        for (let i = 0; i < 10; i++) result.current.decline()
      })
      expect(result.current.level).toBe(0)
      expect(result.current.tier).toBe(QUALITY_TIERS[0])
    })

    it('caps desktop at the top rung', () => {
      stubMatchMedia((q) => q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      act(() => {
        for (let i = 0; i < 10; i++) result.current.incline()
      })
      expect(result.current.level).toBe(QUALITY_TIERS.length - 1)
    })

    it('caps mobile one rung below the top to avoid the soft-shadow startup stutter', () => {
      stubMatchMedia((q) => q.includes('pointer: coarse'))
      const { result } = renderHook(() => useAdaptiveQuality())

      act(() => {
        for (let i = 0; i < 10; i++) result.current.incline()
      })
      expect(result.current.level).toBe(QUALITY_TIERS.length - 2)
      expect(result.current.tier.softShadows).toBe(false)
    })
  })

  describe('reduced motion', () => {
    beforeEach(() => {
      stubMatchMedia((q) => q.includes('prefers-reduced-motion: reduce'))
    })

    it('reflects the OS reduced-motion preference', () => {
      const { result } = renderHook(() => useAdaptiveQuality())
      expect(result.current.reducedMotion).toBe(true)
    })
  })
})
