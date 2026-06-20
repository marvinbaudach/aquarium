import { useMemo, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AdditiveBlending } from 'three'

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

type RaySeed = {
  basePos: [number, number, number]
  baseRot: [number, number, number]
  baseScale: [number, number, number]
  driftPhase: number
  driftSpeed: number
  pulsePhase: number
  pulseSpeed: number
  baseOpacity: number
}

const buildRays = (count: number): RaySeed[] =>
  Array.from({ length: count }, () => ({
    basePos: [rand(-8, 8), rand(5, 9), rand(-10, 4)],
    baseRot: [0, rand(-0.3, 0.3), rand(-0.25, 0.25)],
    baseScale: [rand(1, 2.5), rand(14, 22), 1],
    driftPhase: rand(0, Math.PI * 2),
    driftSpeed: rand(0.08, 0.2),
    pulsePhase: rand(0, Math.PI * 2),
    pulseSpeed: rand(0.4, 1.1),
    baseOpacity: rand(0.25, 0.55),
  }))

const causticsVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const causticsFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  float caustic(vec2 uv, float t) {
    vec2 p = uv * 6.0;
    float v = 0.0;
    vec2 i = p;
    for (int n = 0; n < 4; n++) {
      float time = t * 0.4 + float(n) * 1.3;
      i = p + vec2(cos(time - i.x) + sin(time + i.y), sin(time - i.y) + cos(time + i.x));
      v += 1.0 / length(p + 0.5 * vec2(sin(time + i.x) / i.y, cos(time + i.y) / i.x));
    }
    v = pow(v / 4.0, 3.0);
    return clamp(v, 0.0, 1.5);
  }
  void main() {
    float c = caustic(vUv, uTime);
    float falloff = smoothstep(0.0, 0.5, 1.0 - length(vUv - 0.5) * 1.4);
    vec3 color = mix(vec3(0.15, 0.45, 0.55), vec3(0.85, 1.0, 1.0), c);
    gl_FragColor = vec4(color, c * 0.55 * falloff);
  }
`

export const CausticsFloor = (): ReactElement => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (matRef.current?.uniforms.uTime) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[80, 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={causticsVertex}
        fragmentShader={causticsFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}

const godRayVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const godRayFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  void main() {
    float vertical = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    float horizontal = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
    float shimmer = 0.8 + 0.2 * sin(uTime * 1.8 + vUv.y * 10.0);
    float alpha = vertical * horizontal * shimmer * uOpacity;
    vec3 color = mix(vec3(0.6, 0.9, 1.0), vec3(1.0), vertical);
    gl_FragColor = vec4(color, alpha);
  }
`

export const GodRays = ({ count = 7 }: { count?: number }): ReactElement => {
  const groupRef = useRef<THREE.Group>(null)
  const seeds = useMemo(() => buildRays(count), [count])
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([])
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const sharedUniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 1 } }), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      seeds.forEach((seed, i) => {
        const mesh = meshRefs.current[i]
        const mat = matRefs.current[i]
        if (!mesh || !mat) return
        mesh.position.x = seed.basePos[0] + Math.sin(t * seed.driftSpeed + seed.driftPhase) * 1.5
        mesh.position.z = seed.basePos[2] + Math.cos(t * seed.driftSpeed * 0.7 + seed.driftPhase) * 1.2
        mesh.rotation.z = seed.baseRot[2] + Math.sin(t * seed.driftSpeed * 0.5 + seed.driftPhase) * 0.12
        const uTime = mat.uniforms.uTime
        const uOpacity = mat.uniforms.uOpacity
        if (uTime) uTime.value = t
        if (uOpacity) uOpacity.value = seed.baseOpacity * (0.6 + 0.4 * Math.sin(t * seed.pulseSpeed + seed.pulsePhase))
      })
    }
  })

  return (
    <group ref={groupRef}>
      {seeds.map((seed, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m
          }}
          position={seed.basePos}
          rotation={seed.baseRot}
          scale={seed.baseScale}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={(m) => {
              matRefs.current[i] = m
            }}
            vertexShader={godRayVertex}
            fragmentShader={godRayFragment}
            uniforms={sharedUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec3 pos = position;
    float y = mod(pos.y + uTime * aSpeed + 6.0, 14.0) - 6.0;
    pos.y = y;
    pos.x += sin(uTime * 0.4 + aPhase) * 0.6 + cos(uTime * 0.13 + aPhase * 2.0) * 0.3;
    pos.z += cos(uTime * 0.3 + aPhase) * 0.6 + sin(uTime * 0.17 + aPhase * 1.7) * 0.3;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = smoothstep(-6.0, -2.0, y) * smoothstep(7.0, 3.0, y);
  }
`

const particleFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = (1.0 - d * 2.0) * vAlpha * 0.5;
    gl_FragColor = vec4(0.85, 0.95, 1.0, alpha);
  }
`

export const Particles = ({ count = 200 }: { count?: number }): ReactElement => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = rand(-15, 15)
      positions[i * 3 + 1] = rand(-6, 8)
      positions[i * 3 + 2] = rand(-15, 8)
      sizes[i] = rand(0.4, 2)
      speeds[i] = rand(0.15, 0.5)
      phases[i] = rand(0, Math.PI * 2)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return geo
  }, [count])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (matRef.current?.uniforms.uTime) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
