import { useCallback, useEffect, useState } from 'react'

/** A discrete rung on the quality ladder: a DPR plus which effects are on. */
export interface QualityTier {
  dpr: number
  shadows: boolean
  softShadows: boolean
  postProcessing: boolean
  caustics: boolean
  particles: boolean
}

// The quality ladder, cheapest (index 0) → richest (last). PerformanceMonitor
// walks up and down it live against the frame budget: the most expensive
// effects (post-processing, then soft shadows) are the first to drop when
// frames fall and the last to return when headroom recovers. DPR climbs in
// lockstep so a struggling device gets a smaller framebuffer AND fewer effects.
// Lowest rung, also the typed fallback for an out-of-range index.
const SURVIVAL_TIER: QualityTier = { dpr: 1.0, shadows: false, softShadows: false, postProcessing: false, caustics: false, particles: false }

export const QUALITY_TIERS: readonly QualityTier[] = [
  SURVIVAL_TIER,
  { dpr: 1.0, shadows: true, softShadows: false, postProcessing: false, caustics: false, particles: true },
  { dpr: 1.25, shadows: true, softShadows: false, postProcessing: false, caustics: true, particles: true },
  { dpr: 1.5, shadows: true, softShadows: false, postProcessing: true, caustics: true, particles: true },
  { dpr: 1.75, shadows: true, softShadows: false, postProcessing: true, caustics: true, particles: true },
  { dpr: 2.0, shadows: true, softShadows: true, postProcessing: true, caustics: true, particles: true }
]

// Where each device starts before the monitor has any frame data. Optimistic on
// both — modern phones render this with headroom and a wrong guess self-corrects
// within a second or two.
const DESKTOP_START = 4
const MOBILE_START = 3
// SoftShadows accumulate 100 frames from 8 light samples on mount — a one-off
// startup stutter that hurts phones, so cap mobile one rung below the top.
const MOBILE_MAX = 4

export interface AdaptiveQuality {
  /** True only on genuinely low-power devices (touch-primary, no fine pointer). */
  isMobile: boolean
  /** Respect the OS reduced-motion setting: disables Float, slows animation. */
  reducedMotion: boolean
  /** Live quality rung selected by the frame budget. */
  tier: QualityTier
  /** Current ladder index — handy for diagnostics / the stats overlay. */
  level: number
  /** Step one rung down (wire to PerformanceMonitor's onDecline). */
  decline: () => void
  /** Step one rung up (wire to PerformanceMonitor's onIncline). */
  incline: () => void
}

// Guess whether the device is genuinely weak — NOT just whether the window is
// small and NOT merely whether a touchscreen exists. A narrow window on a
// powerful desktop, or a touchscreen laptop with a trackpad, should still get
// full quality. So the only thing that flags a device as low-power is being
// touch-PRIMARY with no fine pointer available at all (a real phone/tablet):
//   • pointer:coarse        → the primary pointer is a finger/stylus
//   • !any-pointer:fine     → there is no mouse/trackpad anywhere on the device
// hardwareConcurrency / deviceMemory were dropped: they are privacy-capped and
// give false positives on capable 4-core desktops. PerformanceMonitor trims the
// tier live afterwards, so a wrong guess self-corrects toward the real budget.
const detectLowPower = (): boolean => {
  if (typeof window === 'undefined') return false
  const coarse = matchMedia('(pointer: coarse)').matches
  const hasFinePointer = matchMedia('(any-pointer: fine)').matches
  return coarse && !hasFinePointer
}

const detectReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useAdaptiveQuality = (): AdaptiveQuality => {
  const [isMobile] = useState(detectLowPower)
  const [reducedMotion, setReducedMotion] = useState(detectReducedMotion)
  const maxLevel = isMobile ? MOBILE_MAX : QUALITY_TIERS.length - 1
  const [level, setLevel] = useState(isMobile ? MOBILE_START : DESKTOP_START)

  const decline = useCallback(() => {
    setLevel((l) => Math.max(0, l - 1))
  }, [])
  const incline = useCallback(() => {
    setLevel((l) => Math.min(maxLevel, l + 1))
  }, [maxLevel])

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (): void => {
      setReducedMotion(mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
    }
  }, [])

  // decline/incline already clamp level to a valid range; the ?? fallback only
  // satisfies the strict no-unchecked-index rule.
  const tier = QUALITY_TIERS[level] ?? SURVIVAL_TIER
  return { isMobile, reducedMotion, tier, level, decline, incline }
}
