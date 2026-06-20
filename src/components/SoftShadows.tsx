import { AccumulativeShadows, RandomizedLight } from '@react-three/drei'

export const SoftShadows = () => {
  return (
    <AccumulativeShadows temporal frames={100} color="lightblue" colorBlend={2} opacity={0.7} alphaTest={0.65} scale={60} position={[0, -5, 0]}>
      <RandomizedLight amount={8} radius={15} ambient={0.5} intensity={Math.PI} position={[-5, 10, -5]} size={20} />
    </AccumulativeShadows>
  )
}
