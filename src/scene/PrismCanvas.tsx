import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import Prism, { type PrismQuality } from './Prism'
import Light from './Light'
import StudioBackdrop from './StudioBackdrop'
import { BEAM_ENTRY, SPECTRUM_EXIT } from './prismGeometry'
import gsap from 'gsap'
import { stage, zoomNow } from '../lib/stage'
import { prefersReducedMotion } from '../lib/device'
import { softboxTexture } from './softbox'

export type Framing = 'desktop' | 'portrait' | 'mobile'

/** altura visível do mundo no plano do prisma (câmera a 11 de distância, fov 30) */
const WORLD_H = 2 * 11 * Math.tan(THREE.MathUtils.degToRad(15))

/** Posiciona o conjunto: à direita do texto no desktop, alto e centralizado em retrato. */
function Rig({ framing, quality }: { framing: Framing; quality: PrismQuality }) {
  const group = useRef<THREE.Group>(null)
  const { size } = useThree()
  useFrame(({ camera }) => {
    const g = group.current
    if (!g) return
    const wide = size.width / size.height
    if (framing === 'mobile') {
      // celular, tela cheia: o prisma ocupa o espaço reservado na página (mesmo enquadramento do 'portrait',
      // medido pela altura desse espaço) e fica na altura que o MobilePrism calcula a cada quadro
      const toWorld = WORLD_H / size.height
      const k = ((stage.mobile.band * toWorld) / WORLD_H) * stage.mobile.zoom
      g.position.set(-0.75 * k, WORLD_H / 2 - stage.mobile.y * toWorld - 0.05 * k, 0)
      g.scale.setScalar(0.8 * k)
    } else if (framing === 'portrait') {
      g.position.set(-0.75, -0.05, 0)
      g.scale.setScalar(0.8)
    } else {
      // hero: à direita do texto
      // no CTA final o prisma fica um pouco mais à direita, para o texto respirar
      const heroX = (wide > 1.5 ? 1.7 : 1.1) + stage.finale * 0.55
      const heroY = 0.15 - stage.open * 0.25
      const heroS = 1 + stage.open * 0.12
      // espectro: prisma encosta à esquerda e o leque atravessa a tela
      const halfW = 2.95 * wide
      const specS = 1.12
      const specX = -halfW + 0.9 + 1.53 * specS
      const specY = 0.6
      const z = THREE.MathUtils.smoothstep(zoomNow(), 0, 1)
      g.position.set(THREE.MathUtils.lerp(heroX, specX, z), THREE.MathUtils.lerp(heroY, specY, z), 0)
      g.scale.setScalar(THREE.MathUtils.lerp(heroS, specS, z))
    }
    const s = stage.pointerSmooth
    camera.position.set(s.x * 0.25, s.y * 0.15, 11)
    camera.lookAt(0, 0, 0)
  })
  return (
    <group ref={group}>
      <StudioBackdrop showText={framing === 'desktop'} />
      <Light entry={BEAM_ENTRY} exit={SPECTRUM_EXIT} bloom={quality === 'high'} />
      <Prism quality={quality} />
    </group>
  )
}

/**
 * Compila os shaders em paralelo (KHR_parallel_shader_compile) antes do primeiro quadro.
 * Sem isso, a compilação do vidro com transmissão trava a thread principal por segundos na GPU integrada.
 */
function CompileGate({ onDone }: { onDone: () => void }) {
  const { gl, scene, camera } = useThree()
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    let alive = true
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => alive && done.current())
    return () => {
      alive = false
    }
  }, [gl, scene, camera])
  return null
}

/**
 * Entrada (~1,8s): o prisma surge girando, o feixe viaja até o vidro, o brilho acende e o leque abre.
 * Com movimento reduzido tudo aparece junto, rápido, e a animação contínua fica desligada.
 */
export function playIntro(delay = 0) {
  gsap.killTweensOf(stage, 'introPrism,introBeam,introFlare,introFan')
  if (prefersReducedMotion()) {
    stage.idle = 0
    gsap.to(stage, { introPrism: 1, introBeam: 1, introFlare: 1, introFan: 1, duration: 0.5, delay, ease: 'power1.out' })
    return
  }
  gsap
    .timeline({ delay, defaults: { ease: 'power3.out' } })
    .fromTo(stage, { introPrism: 0 }, { introPrism: 1, duration: 0.9 }, 0)
    .fromTo(stage, { introBeam: 0 }, { introBeam: 1, duration: 0.6, ease: 'power2.inOut' }, 0.35)
    .fromTo(stage, { introFlare: 0 }, { introFlare: 1, duration: 0.35, ease: 'back.out(3)' }, 0.92)
    .fromTo(stage, { introFan: 0 }, { introFan: 1, duration: 0.75, ease: 'power2.out' }, 1.05)
}

/**
 * Dispara a entrada só depois que alguns quadros foram de fato desenhados e o ritmo normalizou:
 * o primeiro quadro do vidro trava a thread por um tempo, e a animação não pode acontecer durante a trava.
 */
function IntroTrigger({ onStart }: { onStart: () => void }) {
  const fired = useRef(false)
  const smooth = useRef(0)
  const start = useRef(onStart)
  start.current = onStart
  useFrame((_, delta) => {
    if (fired.current) return
    smooth.current = delta < 0.05 ? smooth.current + 1 : 0
    if (smooth.current >= 4) {
      fired.current = true
      start.current()
    }
  })
  return null
}

type Props = {
  quality?: PrismQuality
  /** pós-processamento (bloom e vinheta): desligado no celular */
  post?: boolean
  /** false pausa o render (fora da tela) */
  active?: boolean
  framing?: Framing
  /** captura estática (gera a imagem do mobile e do Open Graph) */
  capture?: boolean
  onReady?: () => void
}

/** Estúdio escuro com o prisma. Carregado sob demanda, só em aparelho com GPU boa. */
export default function PrismCanvas({ quality = 'high', post = true, active = true, framing = 'desktop', capture = false, onReady }: Props) {
  const soft = softboxTexture()
  const [compiled, setCompiled] = useState(false)
  return (
    <Canvas
      frameloop={compiled && active ? 'always' : 'never'}
      flat
      dpr={capture ? 2 : [1, 1.5]}
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 0, 11] }}
      gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: capture }}
      onCreated={() => {}}
      aria-hidden="true"
    >
      <color attach="background" args={['#07070a']} />
      <Environment resolution={256} frames={1}>
        {/* softboxes grandes e suaves: dão corpo às faces do vidro */}
        <Lightformer form="rect" map={soft} intensity={4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[12, 8, 1]} color="#ffffff" />
        <Lightformer form="rect" map={soft} intensity={2.6} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 10, 1]} color="#eef2ff" />
        <Lightformer form="rect" map={soft} intensity={1.2} position={[0, -3, 7]} scale={[12, 4, 1]} color="#ffffff" />
        {/* reflexo diagonal na face da frente: gradiente de vidro em vez de placa chapada */}
        <Lightformer form="rect" map={soft} intensity={1.4} position={[-1.6, 1.8, 8]} rotation={[0, 0, 0.6]} scale={[5, 3.2, 1]} color="#ffffff" />
        <Lightformer form="rect" map={soft} intensity={4} position={[0, 4, -5]} scale={[10, 2, 1]} color="#ffffff" />
        {/* recortes laterais finos: desenham as arestas */}
        <Lightformer form="rect" intensity={9} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[0.3, 10, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={7} position={[5, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[0.25, 10, 1]} color="#f2f0eb" />
      </Environment>

      <Rig framing={framing} quality={quality} />
      <CompileGate
        onDone={() => {
          setCompiled(true)
          if (capture) {
            // ?capture=portrait&base: só o prisma, sem a luz (imagem inicial do celular antes da entrada)
            const base = new URLSearchParams(window.location.search).has('base')
            stage.introPrism = 1
            stage.introBeam = stage.introFlare = stage.introFan = base ? 0 : 1
            stage.idle = 0
            onReady?.()
          }
        }}
      />
      {compiled && !capture && (
        <IntroTrigger
          onStart={() => {
            playIntro(0.15)
            onReady?.()
          }}
        />
      )}

      {!post ? null : quality === 'high' ? (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.15} intensity={0.75} radius={0.7} />
          <Vignette offset={0.28} darkness={0.72} />
        </EffectComposer>
      ) : (
        // GPU integrada: bloom mais simples (sem mipmap e sem multisample), compila bem mais rápido
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.95} luminanceSmoothing={0.15} intensity={0.9} kernelSize={KernelSize.MEDIUM} />
          <Vignette offset={0.28} darkness={0.72} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
