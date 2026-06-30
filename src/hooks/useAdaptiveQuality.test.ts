import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAdaptiveQuality } from './useAdaptiveQuality'

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
      // Every device now starts at the same optimistic DPR; PerformanceMonitor
      // trims it live on genuinely weak GPUs.
      expect(result.current.dpr).toBe(1.5)
    })

    it('does not flag a desktop with a fine pointer', () => {
      stubMatchMedia((q) => q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      expect(result.current.isMobile).toBe(false)
      expect(result.current.dpr).toBe(1.5)
    })

    it('does not flag a touchscreen laptop (coarse + fine both present)', () => {
      stubMatchMedia((q) => q.includes('pointer: coarse') || q.includes('any-pointer: fine'))
      const { result } = renderHook(() => useAdaptiveQuality())

      expect(result.current.isMobile).toBe(false)
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
