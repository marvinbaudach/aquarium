import { useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { useProgress } from '@react-three/drei'

// DOM overlay (sibling to the Canvas, not inside it) driven by drei's global
// loading manager. useProgress works outside the Canvas because it reads
// three's DefaultLoadingManager via a zustand store. Held visible for a short
// minimum so a fast cache hit doesn't flash the loader on/off.
const MIN_VISIBLE_MS = 500

const overlayStyle = (hidden: boolean): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 18,
  background: 'radial-gradient(circle at 50% 40%, #19475a 0%, #0a2030 100%)',
  color: '#eaf6ff',
  fontFamily: 'Inter, system-ui, sans-serif',
  zIndex: 20,
  opacity: hidden ? 0 : 1,
  pointerEvents: hidden ? 'none' : 'auto',
  transition: 'opacity 0.6s ease'
})

const trackStyle: CSSProperties = {
  width: 200,
  height: 4,
  borderRadius: 2,
  background: 'rgba(255,255,255,0.15)',
  overflow: 'hidden'
}

const barStyle = (pct: number): CSSProperties => ({
  height: '100%',
  width: `${String(pct)}%`,
  background: 'linear-gradient(90deg, #7fd4e6, #eaf6ff)',
  borderRadius: 2,
  transition: 'width 0.3s ease'
})

const labelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  opacity: 0.8
}

export const SceneLoader = (): ReactElement | null => {
  const { active, progress } = useProgress()
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (active) return
    const hide = setTimeout(() => {
      setHidden(true)
    }, MIN_VISIBLE_MS)
    return () => {
      clearTimeout(hide)
    }
  }, [active])

  useEffect(() => {
    if (!hidden) return
    const unmount = setTimeout(() => {
      setMounted(false)
    }, 600)
    return () => {
      clearTimeout(unmount)
    }
  }, [hidden])

  if (!mounted) return null

  return (
    <div style={overlayStyle(hidden)} role="status" aria-live="polite" aria-busy={active}>
      <div style={labelStyle}>Loading aquarium</div>
      <div style={trackStyle} aria-hidden>
        <div style={barStyle(progress)} />
      </div>
      <span style={{ fontSize: 11, opacity: 0.6 }}>{Math.round(progress)}%</span>
    </div>
  )
}
