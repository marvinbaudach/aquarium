import type { CSSProperties, ReactElement } from 'react'
import type { SceneControls } from '../hooks/useSceneControls'

interface ControlDockProps {
  controls: SceneControls
}

const dockStyle: CSSProperties = {
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 20,
  alignItems: 'center',
  padding: '14px 22px',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.14)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.25)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  color: '#eaf6ff',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  zIndex: 10,
  pointerEvents: 'auto',
}

const groupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 96,
}

const labelStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.85,
  fontSize: 10,
}

const inputStyle: CSSProperties = {
  width: '100%',
  accentColor: '#7fd4e6',
  cursor: 'pointer',
}

const toggleStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  gap: 6,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  padding: '6px 10px',
  fontWeight: active ? 600 : 400,
  opacity: active ? 1 : 0.6,
  transition: 'opacity 0.15s',
  whiteSpace: 'nowrap',
})

export const ControlDock = ({ controls }: ControlDockProps): ReactElement => {
  const { turtleSpeed, setTurtleSpeed, sphereCount, setSphereCount, isNight, setIsNight, bloomIntensity, setBloomIntensity } = controls

  return (
    <div style={dockStyle}>
      <div style={groupStyle}>
        <label style={labelStyle}>
          <span>Turtle</span>
          <span>{turtleSpeed.toFixed(2)}</span>
        </label>
        <input style={inputStyle} type="range" min={0} max={1} step={0.05} value={turtleSpeed} onChange={(e) => { setTurtleSpeed(Number(e.target.value)) }} />
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>
          <span>Spheres</span>
          <span>{sphereCount}</span>
        </label>
        <input style={inputStyle} type="range" min={0} max={12} step={1} value={sphereCount} onChange={(e) => { setSphereCount(Number(e.target.value)) }} />
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>
          <span>Bloom</span>
          <span>{bloomIntensity.toFixed(2)}</span>
        </label>
        <input style={inputStyle} type="range" min={0} max={2} step={0.05} value={bloomIntensity} onChange={(e) => { setBloomIntensity(Number(e.target.value)) }} />
      </div>
      <button type="button" style={toggleStyle(isNight)} onClick={() => { setIsNight(!isNight) }}>
        {isNight ? '🌙 Night' : '☀️ Day'}
      </button>
    </div>
  )
}
