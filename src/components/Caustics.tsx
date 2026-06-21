import { useMemo } from 'react'
import type { ReactElement } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Lightweight animated caustics projected onto the floor under the tank.
// A single additive shader plane with no render targets — much cheaper than
// drei's <Caustics> (which traces light through geometry). Procedural layered
// interference pattern, faded out radially so it dissolves into the seabed.
/* eslint-disable react-hooks/immutability */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  float caustic(vec2 uv, float t) {
    vec2 p = uv * 7.0;
    float v = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i) + 1.0;
      p += vec2(sin(t * 0.4 * fi), cos(t * 0.35 * fi));
      v += sin(p.x + t) * cos(p.y - t * 0.7);
    }
    v = abs(v / 3.0);
    return pow(1.0 - clamp(v, 0.0, 1.0), 4.0);
  }

  void main() {
    float c = caustic(vUv, uTime);
    // Radial falloff so the pattern fades to nothing at the plane edges.
    float d = distance(vUv, vec2(0.5));
    float mask = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor * c * uIntensity * mask, 1.0);
  }
`

interface CausticsProps {
  /** World Y of the floor the caustics sit on. */
  y?: number
  /** Plane size. */
  size?: number
  color?: string
  intensity?: number
}

export const Caustics = ({ y = -4.9, size = 42, color = '#9fe6f5', intensity = 0.6 }: CausticsProps): ReactElement => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity }
    }),
    [color, intensity]
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
