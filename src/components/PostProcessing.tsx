import type { ReactElement } from 'react'
import { EffectComposer, Bloom, DepthOfField, Vignette, SMAA } from '@react-three/postprocessing'

interface PostProcessingProps {
  /** Disable DoF on low-power devices (DoF is the most expensive pass). */
  enableDoF: boolean
}

export const PostProcessing = ({ enableDoF }: PostProcessingProps): ReactElement => {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.6} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur />
      {enableDoF ? <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} height={480} /> : <></>}
      <Vignette eskil={false} offset={0.2} darkness={0.6} />
      <SMAA />
    </EffectComposer>
  )
}
