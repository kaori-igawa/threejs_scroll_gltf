'use client'

import { Gltf, useGLTF, AccumulativeShadows, OrbitControls, Environment, RandomizedLight } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, Vignette, ToneMapping, TiltShift2 } from '@react-three/postprocessing'

export default function App() {
  return (
    <>
        {/* <color args={['orange']} attach="background" /> */}
        <group position={[0, 0, 0]}>
            <GeoGltf />
        </group>
        {/* <EffectComposer enableNormalPass>
            <Bloom mipmapBlur intensity={1} luminanceThreshold={2} />
            <N8AO aoRadius={10} intensity={4} screenSpaceRadius />
            <TiltShift2 blur={0.2} />
            <Vignette offset={0.4} darkness={0.4} />
            <ToneMapping />
        </EffectComposer> */}
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        {/* <Environment files={'/FireflyRainbowGradient.jpg'} blur={1} /> */}
        <Environment preset='city' blur={1} />
    </>
  )
}

const GeoGltf = () => {
  return (
    <Gltf src="/test-monkydisp/monky.gltf" scale={2} />
  )
}

useGLTF.preload('/test-monkydisp/monky.gltf')