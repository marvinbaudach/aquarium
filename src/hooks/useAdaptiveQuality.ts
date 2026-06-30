import { useEffect, useState } from 'react'

export interface AdaptiveQuality {
  /** True only on genuinely low-power devices (touch-primary, no fine pointer). */
  isMobile: boolean
  /** Respect the OS reduced-motion setting: disables Float, slows animation. */
  reducedMotion: boolean
  /** Live DPR, trimmed by PerformanceMonitor against the frame budget. */
  dpr: number
  setDpr: (dpr: number) => void
}

// Guess whether the device is genuinely weak — NOT just whether the window is
// small and NOT merely whether a touchscreen exists. A narrow window on a
// powerful desktop, or a touchscreen laptop with a trackpad, should still get
// full quality. So the only thing that flags a device as low-power is being
// touch-PRIMARY with no fine pointer available at all (a real phone/tablet):
//   • pointer:coarse        → the primary pointer is a finger/stylus
//   • !any-pointer:fine     → there is no mouse/trackpad anywhere on the device
// hardwareConcurrency / deviceMemory were dropped: they are privacy-capped and
// give false positives on capable 4-core desktops. PerformanceMonitor trims DPR
// live afterwards, so a wrong guess self-corrects toward the real frame budget.
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
  // Start optimistic on every device — modern phones render this scene with
  // headroom to spare, and a soft DPR-1 image on a 2–3x retina panel is the
  // single most visible "low quality" tell. PerformanceMonitor trims DPR live
  // if a genuinely weak GPU can't keep up, so an over-eager guess self-corrects.
  const [dpr, setDpr] = useState(1.5)

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

  return { isMobile, reducedMotion, dpr, setDpr }
}
