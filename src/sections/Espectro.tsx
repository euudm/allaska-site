import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SOLUTIONS } from '../data/solutions'
import { stage } from '../lib/stage'
import { whatsapp } from '../lib/links'
import { lenis } from '../lib/scroll'
import { prefersReducedMotion, type SceneMode } from '../lib/device'
import type { Solution } from '../data/solutions'
import FanGraphic from '../ui/FanGraphic'
import Magnetic from '../ui/Magnetic'

const TOTAL = SOLUTIONS.length
/** fatia do scroll para a introdução e para o final com todos acesos */
const INTRO = 0.07
const OUTRO = 0.12

/** Raio fino na cor da solução, saindo de um "A" pequeno: o detalhe do topo de cada bloco no celular. */
function MiniBeam({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 320 30" className="block h-[30px] w-full overflow-visible" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        {/* userSpaceOnUse: numa linha reta (sem altura) o degradê padrão não renderiza */}
        <linearGradient id={`mb-${color.slice(1)}`} gradientUnits="userSpaceOnUse" x1="22" y1="0" x2="320" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.12" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(0 2) scale(0.17)" fill="none" stroke="#f2f0eb" strokeOpacity="0.7" strokeWidth="7" strokeLinejoin="round">
        <polygon points="78,3 155,150 100,132 53,62" />
        <polygon points="51,76 84,138 11,144" />
      </g>
      <line data-beam x1="22" y1="16" x2="320" y2="16" stroke={`url(#mb-${color.slice(1)})`} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color})`, transformOrigin: '22px 16px', transformBox: 'view-box' }} />
    </svg>
  )
}

/** Celular: as soluções em fluxo vertical, uma embaixo da outra, sem seção presa. */
function MobileList() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    // vídeo só toca enquanto está na tela
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const v = e.target as HTMLVideoElement
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      }),
      { threshold: 0.5 },
    )
    el.querySelectorAll('video').forEach((v) => io.observe(v))

    const mm = gsap.matchMedia()
    if (!prefersReducedMotion()) {
      mm.add('(max-width: 1023px)', () => {
        el.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
            .fromTo(card, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
            .fromTo(card.querySelector('[data-beam]'), { scale: 0.001 }, { scale: 1, duration: 1.1, ease: 'expo.out' }, 0.1)
        })
      })
    }
    return () => {
      io.disconnect()
      mm.revert()
    }
  }, [])

  const card = (s: Solution) => (
    <li key={s.n} data-card>
      <MiniBeam color={s.color} />
      <p className="eyebrow mt-5 text-[var(--ink-faint)] tabular-nums">
        <span style={{ color: s.color }}>{s.n}</span> / 0{TOTAL}
      </p>
      <h3 className="display mt-3 text-[clamp(30px,8.4vw,40px)]">{s.name}</h3>
      <p className="mt-3 text-[16px] leading-[1.6] text-[var(--ink-soft)]">{s.result}</p>
      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--color-graphite)]">
        <video className="absolute inset-0 h-full w-full scale-[1.08] object-cover" src={`${s.video}.mp4`} poster={`${s.video}.webp`} preload="none" muted loop playsInline />
      </div>
    </li>
  )

  return (
    <div ref={root} className="px-5 pt-24 pb-24 sm:px-8 lg:hidden" aria-hidden="true">
      {/* espaço onde o prisma 3D encaixa no celular; o leque 2D fica de reserva (sem 3D ou enquanto carrega) */}
      <div data-prism-slot className="-mx-5 h-[34svh] w-[calc(100%+2.5rem)] sm:-mx-8 sm:w-[calc(100%+4rem)]">
        <FanGraphic active={TOTAL} className="h-full w-full" />
      </div>
      <p className="eyebrow mt-6 text-[var(--ink-faint)]">O espectro</p>
      <p className="display mt-4 text-[clamp(40px,11vw,56px)]">
        O que sai
        <br />
        <em className="text-[var(--ink-soft)]">do prisma.</em>
      </p>
      <p className="mt-5 text-[16px] leading-[1.6] text-[var(--ink-soft)]">Seis soluções que trabalham como um sistema só. Cada cor é uma delas.</p>

      <ol className="mt-16 flex flex-col gap-16">{SOLUTIONS.map(card)}</ol>

      <div data-card className="mt-20">
        <p className="display text-[clamp(44px,12vw,60px)]">
          Um sistema.
          <br />
          <em className="spectrum-text">Seis saídas.</em>
        </p>
        <p className="mt-5 text-[16px] leading-[1.6] text-[var(--ink-soft)]">
          Você não precisa das seis. Na conversa de diagnóstico a gente vê quais fazem sentido para o seu negócio.
        </p>
        <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid mt-8" data-umami-event="espectro-cta-mobile" tabIndex={-1}>
          <span className="btn-dot" aria-hidden="true" />
          Ver minha demo grátis
        </a>
      </div>
    </div>
  )
}

/** mistura duas cores #rrggbb: amount = quanto de `a` entra (0 a 1) */
function mixHex(a: string, b: string, amount: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p: number, s: number) => (p >> s) & 255
  const mix = (s: number) => Math.round(ch(pa, s) * amount + ch(pb, s) * (1 - amount))
  return `#${((mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).padStart(6, '0')}`
}

/** progresso do scroll no meio de cada etapa (introdução, 6 raios, todos acesos): onde o snap para */
const SNAP = [0, ...SOLUTIONS.map((_, i) => INTRO + ((i + 0.5) * (1 - INTRO - OUTRO)) / TOTAL), 1]

/**
 * Celular com 3D: a seção prende a tela como no desktop. O prisma vivo encaixa no alto (o espaço
 * [data-prism-slot] fica parado enquanto a seção está presa), cada rolada acende um raio, a tela
 * ganha a cor dele e o texto e o vídeo trocam embaixo. O snap faz cada gesto parar numa solução.
 */
function MobileSpectrum({ section }: { section: React.RefObject<HTMLElement | null> }) {
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(max-width: 1023px)', () => {
      const reduced = prefersReducedMotion()
      // snap pela direção do gesto: qualquer rolada para baixo vai para a próxima cor, para cima volta uma
      // (o snap "mais próximo" devolvia gestos curtos para a mesma cor e parecia travado)
      const directional = (v: number) =>
        st.direction > 0 ? (SNAP.find((s) => s >= v - 0.002) ?? 1) : ([...SNAP].reverse().find((s) => s <= v + 0.002) ?? 0)
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        // com o Lenis ligado (mouse, janela estreita no PC) o snap nativo briga com a rolagem suave: fica sem
        snap: reduced || lenis ? undefined : { snapTo: directional, duration: { min: 0.25, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
        onToggle: (self) => {
          gsap.to(stage, { focusMix: self.isActive ? 1 : 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
          // seção presa: o botão fixo de WhatsApp sai da frente (a seção tem o próprio, no fim)
          document.documentElement.classList.toggle('spectrum-pinned', self.isActive)
        },
        onUpdate: (self) => {
          const i = indexFor(self.progress)
          stage.active = i
          setActive((prev) => (prev === i ? prev : i))
        },
        onLeave: () => {
          stage.active = -1
          setActive(TOTAL)
        },
        onLeaveBack: () => {
          stage.active = -1
          setActive(-1)
        },
      })
    })
    return () => {
      mm.revert()
      stage.active = -1
      stage.focusMix = 0
      document.documentElement.classList.remove('spectrum-pinned')
    }
  }, [section])

  // só o vídeo da solução ativa baixa e toca
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else v.pause()
    })
  }, [active])

  // a barra do navegador (Chrome no Android; Safari no iPhone até a versão 18) ganha um tom escuro da cor do raio
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return
    const base = meta.dataset.base ?? meta.content
    meta.dataset.base = base
    const s = active >= 0 && active < TOTAL ? SOLUTIONS[active] : null
    meta.content = s ? mixHex(s.color, base, 0.24) : base
  }, [active])
  useEffect(
    () => () => {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (meta?.dataset.base) meta.content = meta.dataset.base
    },
    [],
  )

  // vibração curta a cada raio que acende; dupla quando todos acendem. Só Android (o iPhone não expõe
  // vibração para sites), e o navegador só libera depois do primeiro toque da pessoa na página
  const lastBuzz = useRef(active)
  useEffect(() => {
    if (active === lastBuzz.current) return
    const forward = active > lastBuzz.current
    lastBuzz.current = active
    if (active < 0 || prefersReducedMotion() || !('vibrate' in navigator)) return
    try {
      navigator.vibrate(active >= TOTAL && forward ? [12, 60, 18] : 10)
    } catch {
      /* sem permissão ainda: segue sem vibrar */
    }
  }, [active])

  const current = active >= 0 && active < TOTAL ? SOLUTIONS[active] : null
  const tint = current?.color ?? null

  return (
    <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-5 pt-[68px] pb-5 sm:px-8 lg:hidden" aria-hidden="true">
      {/* a cor do raio ativo banha a tela: forte onde o leque sai, sutil embaixo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700"
        style={{
          opacity: tint ? 1 : 0,
          background: tint
            ? `radial-gradient(90% 38% at 85% 24%, ${tint}38, transparent 70%), radial-gradient(120% 45% at 50% 105%, ${tint}24, transparent 70%)`
            : undefined,
        }}
      />

      {/* espaço do prisma 3D; o leque 2D (com o raio ativo) fica de reserva enquanto o 3D carrega */}
      <div data-prism-slot className="-mx-5 h-[30svh] w-[calc(100%+2.5rem)] shrink-0 sm:-mx-8 sm:w-[calc(100%+4rem)]">
        <FanGraphic active={active} className="h-full w-full" />
      </div>

      {/* régua do espectro: uma marca por solução */}
      <div className="mt-3 flex items-center gap-4">
        <span className="eyebrow text-[var(--ink-faint)] tabular-nums">
          {current ? (
            <>
              <span style={{ color: current.color }}>{current.n}</span> / 0{TOTAL}
            </>
          ) : active >= TOTAL ? (
            'Seis saídas'
          ) : (
            'O espectro'
          )}
        </span>
        <span className="flex flex-1 gap-1.5">
          {SOLUTIONS.map((s, i) => (
            <span
              key={s.n}
              className="h-[2px] flex-1 rounded-full transition-all duration-500"
              style={{ background: s.color, opacity: active === i || active >= TOTAL ? 1 : active > i ? 0.45 : 0.15 }}
            />
          ))}
        </span>
      </div>

      <div key={active} className="swap-in mt-5">
        {active < 0 && (
          <>
            <p className="display text-[clamp(38px,10.5vw,52px)]">
              O que sai
              <br />
              <em className="text-[var(--ink-soft)]">do prisma.</em>
            </p>
            <p className="mt-4 text-[16px] leading-[1.55] text-[var(--ink-soft)]">
              Seis soluções que trabalham como um sistema só. Cada cor é uma delas. Role para acender uma de cada vez.
            </p>
          </>
        )}
        {current && (
          <>
            <p className="display text-[clamp(30px,8.2vw,40px)]">{current.name}</p>
            <p className="mt-3 text-[15px] leading-[1.55] text-[var(--ink-soft)]">{current.result}</p>
          </>
        )}
        {active >= TOTAL && (
          <>
            <p className="display text-[clamp(40px,11vw,56px)]">
              Um sistema.
              <br />
              <em className="spectrum-text">Seis saídas.</em>
            </p>
            <p className="mt-4 text-[16px] leading-[1.55] text-[var(--ink-soft)]">
              Você não precisa das seis. Na conversa de diagnóstico a gente vê quais fazem sentido para o seu negócio.
            </p>
            <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid mt-6" data-umami-event="espectro-cta-mobile" tabIndex={-1}>
              <span className="btn-dot" aria-hidden="true" />
              Ver minha demo grátis
            </a>
          </>
        )}
      </div>

      {/* vídeos empilhados: só o ativo aparece e toca */}
      <div
        className="relative mt-5 aspect-video max-h-[24svh] w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--color-graphite)] transition-opacity duration-500"
        style={{ opacity: current ? 1 : 0, display: active >= TOTAL ? 'none' : undefined }}
      >
        {SOLUTIONS.map((s, i) => (
          <video
            key={s.n}
            ref={(el) => {
              videos.current[i] = el
            }}
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0 }}
            src={`${s.video}.mp4`}
            poster={`${s.video}.webp`}
            preload="none"
            muted
            loop
            playsInline
          />
        ))}
      </div>
    </div>
  )
}

function indexFor(p: number) {
  if (p < INTRO) return -1
  if (p >= 1 - OUTRO) return TOTAL
  return Math.min(TOTAL - 1, Math.floor(((p - INTRO) / (1 - INTRO - OUTRO)) * TOTAL))
}

/** live: celular com o prisma 3D (seção presa); sem ele, a lista vertical de sempre */
export default function Espectro({ mode, live = false }: { mode: SceneMode; live?: boolean }) {
  const root = useRef<HTMLElement>(null)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const mm = gsap.matchMedia()
    // desktop: seção presa, o prisma se aproxima e um raio de cada vez acende
    mm.add('(min-width: 1024px)', () => {
      // aproxima o prisma quando a seção entra
      gsap.fromTo(
        stage,
        { zoom: 0 },
        { zoom: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: 0.6 } },
      )
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const i = indexFor(self.progress)
          stage.active = i
          setActive((prev) => (prev === i ? prev : i))
        },
        onLeaveBack: () => {
          stage.active = -1
          setActive(-1)
        },
      })
    })
    return () => mm.revert()
  }, [])

  // só o vídeo da solução ativa baixa e toca
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else v.pause()
    })
  }, [active])

  const current = active >= 0 && active < TOTAL ? SOLUTIONS[active] : null
  const lite = mode === 'lite'

  return (
    <section id="espectro" ref={root} aria-labelledby="espectro-title" className={`relative lg:h-[700svh] ${live ? 'h-[620svh]' : ''}`}>
      {/* lista completa para leitores de tela e buscadores */}
      <div className="sr-only">
        <h2 id="espectro-title">Seis soluções, um sistema</h2>
        <ol>
          {SOLUTIONS.map((s) => (
            <li key={s.n}>
              {s.name}: {s.result}
            </li>
          ))}
        </ol>
      </div>

      {live ? <MobileSpectrum section={root} /> : <MobileList />}

      <div className="sticky top-0 hidden h-[100svh] overflow-hidden lg:block" aria-hidden="true">
        <div
          className={
            lite
              ? 'mx-auto flex h-full max-w-[620px] flex-col justify-center px-4 pt-16 pb-6 sm:px-8'
              : 'absolute top-1/2 right-[5vw] w-[min(500px,36vw)] -translate-y-1/2 xl:right-[7vw]'
          }
        >
          {lite && <FanGraphic active={active} className="-mx-4 mb-2 h-[24svh] w-[calc(100%+2rem)] shrink-0" />}

          {/* régua do espectro: uma marca por solução */}
          <div className="mb-6 flex items-center gap-4">
            <span className="eyebrow text-[var(--ink-faint)] tabular-nums">
              {current ? (
                <>
                  <span style={{ color: current.color }}>{current.n}</span> / 0{TOTAL}
                </>
              ) : (
                'O espectro'
              )}
            </span>
            <span className="flex flex-1 gap-1.5">
              {SOLUTIONS.map((s, i) => (
                <span
                  key={s.n}
                  className="h-[2px] flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: s.color,
                    opacity: active === i || active >= TOTAL ? 1 : active > i ? 0.45 : 0.15,
                  }}
                />
              ))}
            </span>
          </div>

          <div key={active} className="swap-in">
            {active < 0 && (
              <>
                <p className="display text-[clamp(38px,4.4vw,68px)]">
                  O que sai
                  <br />
                  <em className="text-[var(--ink-soft)]">do prisma.</em>
                </p>
                <p className="mt-6 max-w-[400px] text-[var(--ink-soft)]">
                  Seis soluções que trabalham como um sistema só. Cada cor é uma delas. Role para ver uma de cada vez.
                </p>
              </>
            )}

            {current && (
              <>
                <p className="display text-[clamp(32px,3.4vw,52px)]">{current.name}</p>
                <p className="mt-4 max-w-[440px] text-[16px] leading-[1.6] text-[var(--ink-soft)] sm:text-[17px]">{current.result}</p>
              </>
            )}

            {active >= TOTAL && (
              <>
                <p className="display text-[clamp(40px,4.8vw,76px)]">
                  Um sistema.
                  <br />
                  <em className="spectrum-text">Seis saídas.</em>
                </p>
                <p className="mt-6 max-w-[400px] text-[var(--ink-soft)]">
                  Você não precisa das seis. Na conversa de diagnóstico a gente vê quais fazem sentido para o seu negócio.
                </p>
                <div className="mt-8">
                  <Magnetic>
                    <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid" data-umami-event="espectro-cta" tabIndex={-1}>
                      <span className="btn-dot" aria-hidden="true" />
                      Ver minha demo grátis
                    </a>
                  </Magnetic>
                </div>
              </>
            )}
          </div>

          {/* vídeos empilhados: só o ativo aparece e toca */}
          <div
            className="relative mt-7 aspect-video w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--color-graphite)] transition-opacity duration-500"
            style={{ opacity: current ? 1 : 0 }}
          >
            {SOLUTIONS.map((s, i) => (
              <video
                key={s.n}
                ref={(el) => {
                  videos.current[i] = el
                }}
                className="absolute inset-0 h-full w-full scale-[1.08] object-cover transition-opacity duration-500"
                style={{ opacity: i === active ? 1 : 0 }}
                src={`${s.video}.mp4`}
                poster={`${s.video}.webp`}
                preload="none"
                muted
                loop
                playsInline
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
