import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SPECTRUM, stage, zoomNow } from '../lib/stage'

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying float vWorldY;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorldY = w.y;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

/**
 * Raio de luz: uv.x ao longo do comprimento, uv.y na largura.
 * Cor em HDR (acima de 1) para o bloom pegar só a luz.
 */
const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uReveal;
  uniform float uSpreadStart;
  uniform float uFadeIn;
  uniform float uFadeOut;
  uniform float uTime;
  uniform float uSeed;
  uniform float uClipTop;
  uniform float uHalo;
  uniform float uShimmer;
  varying vec2 vUv;
  varying float vWorldY;

  void main() {
    float along = vUv.x;
    if (along > uReveal) discard;
    // o raio abre conforme se afasta da origem
    float width = mix(uSpreadStart, 1.0, along);
    float across = (vUv.y - 0.5) / (0.5 * width);
    float core = exp(-across * across * 5.0);
    float halo = exp(-across * across * 1.4) * uHalo;
    float ends = pow(smoothstep(0.0, uFadeIn, along), 3.0) * (1.0 - smoothstep(1.0 - uFadeOut, 1.0, along / max(uReveal, 0.001)));
    // cintilação quase imperceptível, para a luz não parecer congelada
    float flicker = 0.94 + 0.06 * sin(uTime * 1.7 + uSeed * 11.0 + along * 6.0);
    // shimmer: uma onda de intensidade que corre ao longo do raio, como luz viva
    float wave = sin(along * 9.0 - uTime * 1.6 + uSeed * 1.7) * 0.5 + 0.5;
    flicker *= 1.0 + uShimmer * (pow(wave, 3.0) * 0.55 - 0.12);
    // some antes do topo da tela, para não cruzar a navegação
    float top = 1.0 - smoothstep(uClipTop - 1.1, uClipTop, vWorldY);
    float a = (core + halo) * ends * flicker * top * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
    #include <colorspace_fragment>
  }
`

function makeRayMaterial(color: string, spreadStart: number, fadeIn: number, fadeOut: number, seed: number) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 0 },
      uReveal: { value: 1 },
      uSpreadStart: { value: spreadStart },
      uFadeIn: { value: fadeIn },
      uFadeOut: { value: fadeOut },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uClipTop: { value: 99 },
      uHalo: { value: 0.35 },
      uShimmer: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    side: THREE.DoubleSide,
  })
}

const flareFragment = /* glsl */ `
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float core = exp(-r * r * 180.0);
    float glow = exp(-r * r * 22.0) * 0.35;
    // leve estria horizontal, como o brilho de uma lente
    float streak = exp(-p.y * p.y * 900.0) * exp(-p.x * p.x * 9.0) * 0.4;
    float a = (core + glow + streak) * uIntensity;
    gl_FragColor = vec4(vec3(1.0, 0.98, 0.95) * a, a);
    #include <colorspace_fragment>
  }
`

/** Plano unitário com origem na ponta esquerda: escala em x = comprimento. */
const unitRay = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0)

type Props = { entry: THREE.Vector2; exit: THREE.Vector2; bloom?: boolean }

/**
 * Feixe branco que entra pela esquerda + leque de 6 raios (um por solução) que sai pela direita.
 * Tudo em z = 0, atravessando o meio do prisma.
 */
export default function Light({ entry, exit, bloom = true }: Props) {
  // sem bloom (GPU integrada): menos intensidade para não estourar e mais halo para simular o brilho
  const gain = bloom ? 1 : 0.9
  const beam = useMemo(() => {
    const m = makeRayMaterial('#ffffff', 0.7, 0.3, 0.02, 0)
    // topo visível da cena em z = 0 fica perto de y = 2,95 (fov 30, câmera em z = 11)
    m.uniforms.uClipTop.value = 2.75
    return m
  }, [])
  const inner = useMemo(() => makeRayMaterial('#f4f1ff', 0.9, 0.05, 0.1, 0.5), [])
  const rays = useMemo(() => SPECTRUM.map((c, i) => makeRayMaterial(c, 0.08, 0.04, 0.35, i + 1)), [])
  // ponto de brilho onde o feixe toca o vidro
  const flare = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: flareFragment,
        uniforms: { uIntensity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )

  // feixe desce do alto, fora da tela, sem cruzar a headline
  const beamStart = useMemo(() => new THREE.Vector2(entry.x - 4.2, entry.y + 6.2), [entry])
  const beamDir = useMemo(() => entry.clone().sub(beamStart), [entry, beamStart])
  const innerDir = useMemo(() => exit.clone().sub(entry), [entry, exit])

  const rayMeshes = useRef<(THREE.Mesh | null)[]>([])
  // quanto cada raio está em destaque (1 = normal), suavizado entre frames
  const focus = useRef(SPECTRUM.map(() => 1))

  const flareMesh = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // a entrada já deixa o leque aberto; o scroll pelo hero abre o resto
    const o = Math.max(stage.open, 0.62 * stage.introFan)
    const zoom = zoomNow()
    const idle = stage.idle
    // toque rápido no prisma: o feixe e o espectro brilham forte por um instante
    const pulse = 1 + stage.pulse * 1.4
    // saindo do hero: o espectro abre mais e fica mais intenso antes de esmaecer
    const exit = stage.heroExit * stage.exitMix * (1 - zoom)
    // no CTA final o espectro volta mais intenso que no hero
    const boost = (1 + stage.finale * 0.25 + exit * 0.5) * gain * pulse
    beam.uniforms.uTime.value = t
    beam.uniforms.uIntensity.value = (0.45 + o * 1.5) * gain * pulse
    // entrada: o feixe viaja de fora da tela até o vidro
    beam.uniforms.uReveal.value = stage.introBeam
    // brilho do ponto de contato: acende na entrada e pulsa devagar depois
    const breathe = 1 + idle * 0.12 * Math.sin(t * 2.1)
    flare.uniforms.uIntensity.value = (1.1 + o * 1.8) * (1 - zoom * 0.55) * boost * stage.introFlare * breathe
    if (flareMesh.current) flareMesh.current.scale.setScalar(0.6 + 0.4 * stage.introFlare + stage.pulse * 0.35)
    inner.uniforms.uIntensity.value = (0.12 + o * 0.7) * stage.introFlare * pulse
    // inclinação do celular: o leque gira e abre junto com o prisma
    const tiltTurn = stage.tilt.y * 0.55 + stage.drag * 0.35
    const tiltSpread = 1 + stage.tilt.x * 1.2
    rays.forEach((m, i) => {
      m.uniforms.uTime.value = t
      m.uniforms.uHalo.value = bloom ? 0.35 : 0.45
      m.uniforms.uShimmer.value = idle
      // cada raio acende um pouco depois do anterior
      const local = THREE.MathUtils.clamp(o * 1.35 - i * 0.045, 0, 1)
      // entrada: o leque varre de um raio ao outro
      const sweep = THREE.MathUtils.clamp(stage.introFan * 1.5 - i * 0.1, 0, 1)
      const a = stage.active
      const target = a < 0 ? 1 : a >= SPECTRUM.length ? 1 : i === a ? 1.35 : 0.07
      // destaque do raio ativo: no desktop vem com a aproximação; no celular, com a seção presa (focusMix)
      const f = 1 + (target - 1) * Math.max(zoom, stage.focusMix)
      focus.current[i] += (f - focus.current[i]) * 0.08
      // de perto os raios ocupam muito mais tela: intensidade menor para o bloom não lavar tudo
      m.uniforms.uIntensity.value = (0.12 + local * 2.3 + exit * 0.6) * focus.current[i] * (1 - zoom * 0.45) * boost * Math.min(1, sweep * 1.4)
      m.uniforms.uReveal.value = (0.25 + local * 0.75) * sweep
      // o leque começa fechado e se abre com o scroll
      const mesh = rayMeshes.current[i]
      // no espectro o leque inclina para baixo e passa sob o texto do painel
      if (mesh) mesh.rotation.z = -0.12 - zoom * 0.26 + tiltTurn - i * 0.1 * (0.3 + 0.7 * o + exit * 0.35) * tiltSpread
    })
  })

  return (
    <group>
      <mesh
        geometry={unitRay}
        material={beam}
        position={[beamStart.x, beamStart.y, 0]}
        rotation={[0, 0, Math.atan2(beamDir.y, beamDir.x)]}
        scale={[beamDir.length(), 0.12, 1]}
        renderOrder={5}
      />
      <mesh
        geometry={unitRay}
        material={inner}
        position={[entry.x, entry.y, 0]}
        rotation={[0, 0, Math.atan2(innerDir.y, innerDir.x)]}
        scale={[innerDir.length(), 0.12, 1]}
        renderOrder={5}
      />
      <mesh ref={flareMesh} position={[entry.x, entry.y, 0.5]} material={flare} renderOrder={6}>
        <planeGeometry args={[1.3, 1.3]} />
      </mesh>
      {rays.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rayMeshes.current[i] = el
          }}
          geometry={unitRay}
          material={m}
          position={[exit.x, exit.y, 0]}
          scale={[9, 0.9, 1]}
          renderOrder={5}
        />
      ))}
    </group>
  )
}
