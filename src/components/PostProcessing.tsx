import type { ReactElement } from 'react'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'

interface PostProcessingProps {
  /** Bloom intensity multiplier (driven by the control dock). */
  bloomIntensity: number
}

export const PostProcessing = ({ bloomIntensity }: PostProcessingProps): ReactElement => {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} stencilBuffer>
      <Bloom intensity={bloomIntensity} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={0.6} />
      <SMAA />
    </EffectComposer>
  )
}
