import type { ReactElement } from 'react'
import { BackSide } from 'three'
import { GradientTexture } from '@react-three/drei'

interface SeaBackgroundProps {
  isNight: boolean
}

// Deep-sea vertical gradient on a large inverted sphere: lit near the surface
// (top), darkening into depth (bottom). Fog is disabled on this material so the
// gradient reads cleanly behind the fogged mid-ground. Requires the camera far
// plane to reach past its radius (see App camera config).
export const SeaBackground = ({ isNight }: SeaBackgroundProps): ReactElement => {
  const colors = isNight ? ['#0a2733', '#06141e', '#020a12'] : ['#2f7e90', '#11414f', '#06141e']

  return (
    <mesh scale={55} renderOrder={-2000}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial side={BackSide} fog={false} depthWrite={false} toneMapped={false}>
        <GradientTexture attach="map" stops={[0, 0.5, 1]} colors={colors} />
      </meshBasicMaterial>
    </mesh>
  )
}
