import * as THREE from 'three'

let cached: THREE.CanvasTexture | null = null

/** Textura radial branca que some nas bordas: softbox sem aresta dura no reflexo do vidro. */
export function softboxTexture() {
  if (cached) return cached
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.45, '#bdbdbd')
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  cached = new THREE.CanvasTexture(c)
  cached.colorSpace = THREE.SRGBColorSpace
  return cached
}
