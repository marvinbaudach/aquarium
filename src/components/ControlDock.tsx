import type { ReactElement } from 'react'
import type { SceneControls } from '../hooks/useSceneControls'
import styles from './ControlDock.module.css'

interface ControlDockProps {
  controls: SceneControls
}

interface SliderControlProps {
  id: string
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

const SliderControl = ({ id, label, value, display, min, max, step, onChange }: SliderControlProps): ReactElement => (
  <div className={styles.group}>
    <label className={styles.label} htmlFor={id}>
      <span>{label}</span>
      <span>{display}</span>
    </label>
    <input
      id={id}
      className={styles.slider}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      aria-valuetext={display}
      onChange={(e) => {
        onChange(Number(e.target.value))
      }}
    />
  </div>
)

export const ControlDock = ({ controls }: ControlDockProps): ReactElement => {
  const { turtleSpeed, setTurtleSpeed, sphereCount, setSphereCount, isNight, setIsNight, bloomIntensity, setBloomIntensity } = controls

  return (
    <div className={styles.dock} role="group" aria-label="Scene controls">
      <SliderControl
        id="ctrl-turtle"
        label="Turtle"
        value={turtleSpeed}
        display={turtleSpeed.toFixed(2)}
        min={0}
        max={1}
        step={0.05}
        onChange={setTurtleSpeed}
      />
      <SliderControl id="ctrl-spheres" label="Spheres" value={sphereCount} display={String(sphereCount)} min={0} max={12} step={1} onChange={setSphereCount} />
      <SliderControl
        id="ctrl-bloom"
        label="Bloom"
        value={bloomIntensity}
        display={bloomIntensity.toFixed(2)}
        min={0}
        max={2}
        step={0.05}
        onChange={setBloomIntensity}
      />
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={isNight}
        onClick={() => {
          setIsNight(!isNight)
        }}
      >
        {isNight ? '🌙 Night' : '☀️ Day'}
      </button>
    </div>
  )
}
