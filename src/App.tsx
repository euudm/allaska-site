import { lazy, startTransition, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { canMobile3D, detectGpuTier, detectSceneMode, prefersReducedMotion, useMatch, useNarrow, type SceneMode } from './lib/device'
import MobilePrism from './scene/MobilePrism'
import MobileBeams from './scene/MobileBeams'
import { useSmoothScroll } from './lib/scroll'
import { stage } from './lib/stage'
import Nav from './ui/Nav'
import Cursor from './ui/Cursor'
import Loader from './ui/Loader'
import StickyCta from './ui/StickyCta'
import { LogoMark } from './ui/Logo'
import Hero from './sections/Hero'
import Manifesto from './sections/Manifesto'
import Espectro from './sections/Espectro'
import ComoFunciona from './sections/ComoFunciona'
import Projetos from './sections/Projetos'
import Fundadores from './sections/Fundadores'
import Contato from './sections/Contato'

const PrismCanvas = lazy(() => import('./scene/PrismCanvas'))

/** ?capture=desktop | portrait | og: só a cena, para gerar as imagens estáticas. */
const captureMode = new URLSearchParams(window.location.search).get('capture')


function Capture({ framing, og }: { framing: 'desktop' | 'portrait'; og?: boolean }) {
  stage.open = 0.8
  return (
    <div className="fixed inset-0">
      <Suspense fallback={null}>
        <PrismCanvas capture framing={framing} />
      </Suspense>
      {/* imagem de compartilhamento (Open Graph): marca + headline sobre a cena */}
      {og && (
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between p-[56px]">
          <span className="flex items-center gap-3">
            <LogoMark className="h-[26px] w-[27px]" />
            <span className="text-[22px] font-semibold tracking-[-0.03em]">Allaska</span>
          </span>
          <p className="display text-[64px]">
            Seu cliente já está
            <br />
            procurando.
            <br />
            <em className="text-[var(--ink-soft)]">Só não está te encontrando.</em>
          </p>
          <span className="eyebrow text-[var(--ink-faint)]">Sites e sistemas com IA · allaska.com.br</span>
        </div>
      )}
    </div>
  )
}

export default function App() {
  if (captureMode) return <Capture framing={captureMode === 'portrait' ? 'portrait' : 'desktop'} og={captureMode === 'og'} />
  return <Site />
}

function Site() {
  const [mode] = useState(detectSceneMode)
  const [gpu] = useState(() => (mode === 'full' ? detectGpuTier() : 'low'))
  const [sceneLive, setSceneLive] = useState(false)
  // janela estreita (redimensionada ou tablet em pé): as seções usam a versão de celular e o 3D fica escondido
  const narrow = useNarrow()
  const view: SceneMode = mode === 'full' && !narrow ? 'full' : 'lite'
  // celular: um prisma 3D só, que acompanha a página inteira
  // (reavaliado quando a janela muda de largura: abrir largo e estreitar depois também liga o 3D)
  const phone = useMatch('(max-width: 639px)')
  const mobile3D = useMemo(() => phone && canMobile3D(view), [phone, view])
  // sem 3D de celular (sem WebGL, janela larga...): o topo não espera no escuro, a foto do prisma aparece
  useEffect(() => {
    if (!mobile3D) document.documentElement.classList.remove('m3d', 'm3d-live')
  }, [mobile3D])
  // o hero pinta primeiro; o resto monta depois, fatiado pelo React (sem travar a thread principal)
  const [rest, setRest] = useState(false)
  useEffect(() => {
    // o hero do React já está pintado por baixo do casco estático: pode tirar
    document.getElementById('shell')?.remove()
    const id = requestAnimationFrame(() => startTransition(() => setRest(true)))
    return () => cancelAnimationFrame(id)
  }, [])
  const sceneLayer = useRef<HTMLDivElement>(null)
  useSmoothScroll()

  // a cena recua no manifesto, volta no espectro e some depois dele
  useEffect(() => {
    if (mode !== 'full' || !rest) return
    const scrub = !prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.to(stage, { dim: 1, ease: 'none', scrollTrigger: { trigger: '#manifesto', start: 'top 85%', end: 'top 20%', scrub } })
      gsap.to(stage, { after: 1, ease: 'none', scrollTrigger: { trigger: '#como-funciona', start: 'top bottom', end: 'top 35%', scrub } })
      gsap.to(stage, { finale: 1, ease: 'none', scrollTrigger: { trigger: '#contato', start: 'top bottom', end: 'top top', scrub } })
      gsap.to(stage, { outro: 1, ease: 'none', scrollTrigger: { trigger: '#faq', start: 'top 85%', end: 'top 30%', scrub } })
    })
    const tick = () => {
      const visible = (1 - stage.dim * 0.9 * (1 - stage.zoom)) * (1 - stage.after * (1 - stage.finale)) * (1 - stage.outro)
      if (sceneLayer.current) sceneLayer.current.style.setProperty('--dim', visible.toFixed(3))
    }
    gsap.ticker.add(tick)
    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
    }
  }, [mode, rest])

  // as seções montadas depois mudam a altura da página: recalcula os gatilhos uma vez
  useEffect(() => {
    if (!rest) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [rest])

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Loader enabled={mode === 'full'} hold={mode === 'full' && !sceneLive} />
      {mode === 'full' && (
        <div ref={sceneLayer} className={`scene-layer ${sceneLive ? 'is-live' : ''}`} style={narrow ? { display: 'none' } : undefined}>
          <div className="h-full w-full" style={{ opacity: 'var(--dim, 1)' }}>
            <Suspense fallback={null}>
              <PrismCanvas quality={gpu} onReady={() => setSceneLive(true)} />
            </Suspense>
          </div>
        </div>
      )}
      {mobile3D && <MobilePrism />}
      {phone && view === 'lite' && !prefersReducedMotion() && <MobileBeams />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      <StickyCta />

      <main id="conteudo">
        <Hero mode={view} />
        {rest && (
          <>
            <Manifesto />
            <Espectro mode={view} live={mobile3D} />
            <ComoFunciona />
            <Projetos />
            <Fundadores />
            <Contato mode={view} />
          </>
        )}
      </main>
    </>
  )
}
