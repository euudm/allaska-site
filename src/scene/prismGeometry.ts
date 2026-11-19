import * as THREE from 'three'

/** Polígonos do "A" do logo (mesmo viewBox 158×152 do LogoMark). */
const BLADE: [number, number][] = [
  [78, 3],
  [155, 150],
  [100, 132],
  [53, 62],
]
// deslocado em direção à lâmina: no logo original o vão é largo e, em vidro, o "A" vira dois triângulos
const WEDGE: [number, number][] = [
  [51, 76],
  [84, 138],
  [11, 144],
]

const CX = 78.5
const CY = 76.5
const UNIT = 50

/** Converte um ponto do logo para unidades da cena (y para cima, centrado). */
export const toScene = ([x, y]: [number, number]) => new THREE.Vector2((x - CX) / UNIT, (CY - y) / UNIT)

/** Polígono com cantos arredondados por curvas quadráticas. */
function roundedShape(points: [number, number][], radius: number) {
  const pts = points.map(toScene)
  const shape = new THREE.Shape()
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n]
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const toPrev = prev.clone().sub(cur)
    const toNext = next.clone().sub(cur)
    const r = Math.min(radius, toPrev.length() * 0.4, toNext.length() * 0.4)
    const a = cur.clone().add(toPrev.normalize().multiplyScalar(r))
    const b = cur.clone().add(toNext.normalize().multiplyScalar(r))
    if (i === 0) shape.moveTo(a.x, a.y)
    else shape.lineTo(a.x, a.y)
    shape.quadraticCurveTo(cur.x, cur.y, b.x, b.y)
  }
  shape.closePath()
  return shape
}

export function makePrismGeometry() {
  const geo = new THREE.ExtrudeGeometry([roundedShape(BLADE, 0.09), roundedShape(WEDGE, 0.07)], {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.07,
    bevelSegments: 10,
    curveSegments: 12,
  })
  // centraliza só no eixo z: x e y já estão no sistema do logo
  geo.translate(0, 0, -0.31)
  geo.computeVertexNormals()
  return geo
}

/** Onde o feixe branco toca a face esquerda da lâmina e onde o espectro sai pela direita. */
export const BEAM_ENTRY = toScene([66, 30])
export const SPECTRUM_EXIT = toScene([118, 80])
