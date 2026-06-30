import { useEffect, useState } from 'react'
import type { CSSProperties, RefObject, ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'

export interface RenderStats {
  triangles: number
  calls: number
}

export type StatsRef = RefObject<RenderStats>

// Lives INSIDE the Canvas. Reads the renderer's per-frame info and writes it to
// a shared ref — never to React state — so reporting stats costs zero extra
// re-renders of the scene tree. The DOM overlay polls this ref on its own clock.
export const StatsBridge = ({ statsRef }: { statsRef: StatsRef }): null => {
  useFrame(({ gl }) => {
    statsRef.current.triangles = gl.info.render.triangles
    statsRef.current.calls = gl.info.render.calls
  })
  return null
}

const SAMPLE_MS = 500

const pillStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(16px + env(safe-area-inset-top, 0px))',
  right: 'calc(16px + env(safe-area-inset-right, 0px))',
  zIndex: 15,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '8px 12px',
  borderRadius: 10,
  background: 'rgba(10,32,48,0.55)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#eaf6ff',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  lineHeight: 1.5,
  cursor: 'pointer',
  minWidth: 84,
  userSelect: 'none'
}

const rowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12 }
const dimStyle: CSSProperties = { opacity: 0.6 }

interface StatsOverlayProps {
  statsRef: StatsRef
  dpr: number
  qualityLevel: number
  maxQualityLevel: number
}

export const StatsOverlay = ({ statsRef, dpr, qualityLevel, maxQualityLevel }: StatsOverlayProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const [display, setDisplay] = useState({ fps: 0, triangles: 0, calls: 0 })

  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()
    const tick = (now: number): void => {
      frames++
      if (now - last >= SAMPLE_MS) {
        setDisplay({
          fps: Math.round((frames * 1000) / (now - last)),
          triangles: statsRef.current.triangles,
          calls: statsRef.current.calls
        })
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [statsRef])

  return (
    <div
      style={pillStyle}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label="Toggle performance stats"
      onClick={() => {
        setOpen((o) => !o)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen((o) => !o)
        }
      }}
    >
      <div style={rowStyle}>
        <span style={dimStyle}>FPS</span>
        <span>{display.fps}</span>
      </div>
      {open && (
        <>
          <div style={rowStyle}>
            <span style={dimStyle}>DPR</span>
            <span>{dpr.toFixed(2)}</span>
          </div>
          <div style={rowStyle}>
            <span style={dimStyle}>QUALITY</span>
            <span>{qualityLevel}/{maxQualityLevel}</span>
          </div>
          <div style={rowStyle}>
            <span style={dimStyle}>TRIS</span>
            <span>{display.triangles.toLocaleString()}</span>
          </div>
          <div style={rowStyle}>
            <span style={dimStyle}>CALLS</span>
            <span>{display.calls}</span>
          </div>
        </>
      )}
    </div>
  )
}
