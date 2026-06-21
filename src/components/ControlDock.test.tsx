import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ControlDock } from './ControlDock'
import type { SceneControls } from '../hooks/useSceneControls'

const makeControls = (overrides: Partial<SceneControls> = {}): SceneControls => ({
  turtleSpeed: 0.5,
  setTurtleSpeed: vi.fn(),
  sphereCount: 12,
  setSphereCount: vi.fn(),
  isNight: false,
  setIsNight: vi.fn(),
  bloomIntensity: 0.6,
  setBloomIntensity: vi.fn(),
  ...overrides
})

describe('ControlDock', () => {
  it('wires each slider to its label and exposes aria-valuetext', () => {
    render(<ControlDock controls={makeControls()} />)

    const turtle = screen.getByLabelText('Turtle')
    expect(turtle).toHaveAttribute('type', 'range')
    expect(turtle).toHaveAttribute('aria-valuetext', '0.50')
  })

  it('reports the chosen number when a slider changes', () => {
    const setBloomIntensity = vi.fn()
    render(<ControlDock controls={makeControls({ setBloomIntensity })} />)

    fireEvent.change(screen.getByLabelText('Bloom'), { target: { value: '1.2' } })

    expect(setBloomIntensity).toHaveBeenCalledWith(1.2)
  })

  it('toggles night mode and reflects pressed state via aria-pressed', () => {
    const setIsNight = vi.fn()
    render(<ControlDock controls={makeControls({ isNight: false, setIsNight })} />)

    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle)
    expect(setIsNight).toHaveBeenCalledWith(true)
  })
})
