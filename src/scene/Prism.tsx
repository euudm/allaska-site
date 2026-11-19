import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { makePrismGeometry } from './prismGeometry'
import { stage, zoomNow } from '../lib/stage'

export type PrismQuality = 'high' | 'low'

/** Fundo que o vidro "enxerga": um pouco mais claro que o estúdio, para ler como objeto sólido. */
const GLASS_BODY = new THREE.Color('#1c1d26')

/** O "A" do logo em vidro óptico. Segue o mouse com inércia, poucos graus. */
export default function Prism({ quality = 'high' }: { quality?: PrismQuality }) {
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(makePrismGeometry, [])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const s = stage.pointerSmooth
    const t = clock.elapsedTime
    const idle = stage.idle
    const TAU = Math.PI * 2
    // entrada: surge girando e crescendo um pouco
    const intro = stage.introPrism
    const spin = (1 - intro) * -0.9
    // saindo do hero: gira ~30° antes de esmaecer (desfeito no zoom do espectro)
    const exit = stage.heroExit * stage.exitMix * (1 - zoomNow()) * 0.52
    // suspenso no ar: ±4° em Y e ±2° em X, sobe e desce num ciclo de ~6s
    const swayY = idle * 0.07 * Math.sin((t * TAU) / 9)
    const swayX = idle * 0.035 * Math.sin((t * TAU) / 7)
    g.rotation.y = s.x * 0.16 + swayY + stage.tilt.y + stage.drag + exit + spin
    g.rotation.x = -s.y * 0.09 + swayX + stage.tilt.x
    g.position.y = idle * 0.06 * Math.sin((t * TAU) / 6)
    g.scale.setScalar(0.86 + 0.14 * intro)
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial
          transmission={1}
          thickness={1.6}
          roughness={0.03}
          ior={1.5}
          chromaticAberration={0.45}
          anisotropicBlur={0.08}
          distortion={0.06}
          distortionScale={0.2}
          temporalDistortion={0.02}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor="#dde6ff"
          attenuationDistance={1.8}
          color="#ffffff"
          background={GLASS_BODY}
          backside={quality === 'high'}
          backsideThickness={0.35}
          samples={quality === 'high' ? 8 : 4}
          resolution={quality === 'high' ? 1024 : 512}
        />
      </mesh>
    </group>
  )
}
