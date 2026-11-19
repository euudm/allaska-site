import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import serifUrl from '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff?url'

/** Degradê transparente, opaco, transparente: as linhas somem nas pontas em vez de cortar seco. */
function useFadeTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 1
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 256, 0)
    g.addColorStop(0, 'black')
    g.addColorStop(0.35, 'white')
    g.addColorStop(0.65, 'white')
    g.addColorStop(1, 'black')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 1)
    return new THREE.CanvasTexture(c)
  }, [])
}

const LINES: { pos: [number, number]; length: number; vertical?: boolean; opacity: number }[] = [
  { pos: [0, -1.6], length: 10, opacity: 0.07 },
  { pos: [0, 0], length: 11, opacity: 0.07 },
  { pos: [0, 1.6], length: 10, opacity: 0.07 },
  { pos: [-2.2, 0], length: 6.5, vertical: true, opacity: 0.05 },
  { pos: [0.2, 0], length: 7, vertical: true, opacity: 0.05 },
  { pos: [2.6, 0], length: 6.5, vertical: true, opacity: 0.05 },
]

/**
 * O que fica atrás do vidro: a marca gigante e linhas finas em baixa opacidade.
 * Existem para a refração ter o que distorcer.
 */
/** showText: o "Allaska" gigante atrás do vidro (sai no celular, onde ficava cortado). */
export default function StudioBackdrop({ showText = true }: { showText?: boolean }) {
  const fade = useFadeTexture()
  return (
    <group position={[0, 0, -3.2]}>
      {showText && (
      <Text font={serifUrl} fontSize={2.7} letterSpacing={-0.04} anchorX="center" anchorY="middle" position={[0.9, 0.1, 0]} color="#0e0e12">
        Allaska
      </Text>
      )}
      {LINES.map((l, i) => (
        <mesh key={i} position={[l.pos[0], l.pos[1], -0.2]} rotation={[0, 0, l.vertical ? Math.PI / 2 : 0]}>
          <planeGeometry args={[l.length, 0.006]} />
          <meshBasicMaterial color="#f2f0eb" alphaMap={fade} transparent opacity={l.opacity} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
