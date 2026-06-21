import { Component } from 'react'
import type { CSSProperties, ErrorInfo, ReactElement, ReactNode } from 'react'

// React error boundaries must be class components — the one place this codebase
// departs from its arrow-only convention (mirrors the documented escape hatch in
// Turtle.tsx). Catches WebGL context-loss / render crashes and shows a graceful
// fallback instead of a blank canvas.
/* eslint-disable react-refresh/only-export-components */

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

const fallbackStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: 24,
  textAlign: 'center',
  background: 'radial-gradient(circle at 50% 40%, #19475a 0%, #0a2030 100%)',
  color: '#eaf6ff',
  fontFamily: 'Inter, system-ui, sans-serif'
}

export const isWebGLAvailable = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGL2RenderingContext) && canvas.getContext('webgl2') !== null
  } catch {
    return false
  }
}

export const WebGLUnavailable = (): ReactElement => (
  <div style={fallbackStyle} role="alert">
    <strong style={{ fontSize: 18 }}>Unable to render the aquarium</strong>
    <p style={{ maxWidth: 360, opacity: 0.8, lineHeight: 1.5 }}>
      This scene needs WebGL2. Try a recent version of Chrome, Firefox or Safari with hardware acceleration enabled.
    </p>
  </div>
)

export class WebGLErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Aquarium scene crashed:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (this.state.hasError) return <WebGLUnavailable />
    return this.props.children
  }
}
