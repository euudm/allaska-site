import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { whatsapp } from '../lib/links'
import { canMobile3D, prefersReducedMotion, type SceneMode } from '../lib/device'
import { stage } from '../lib/stage'
import Magnetic from '../ui/Magnetic'

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties

export default function Hero({ mode }: { mode: SceneMode }) {
  const root = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const stillSlot = useRef<HTMLDivElement>(null)
  // no celular a imagem do prisma já foi pintada pelo casco estático: o React adota o mesmo nó
  // em vez de criar outro, para o navegador não contar uma segunda imagem como LCP
  // celular com 3D: o prisma vivo (MobilePrism, montado no App) encaixa no espaço desta imagem
  const [live] = useState(() => canMobile3D(mode))
  const [adopt] = useState(() => mode === 'lite' && Boolean(document.querySelector('#shell picture')))
  // celular: o prisma 3D de verdade entra por cima da imagem (giroscópio, toque, animação)

  useLayoutEffect(() => {
    if (!adopt) return
    const pic = document.querySelector('#shell picture')
    if (pic && stillSlot.current) stillSlot.current.appendChild(pic)
    // a imagem do casco é só o prisma (a luz entra com a animação 3D); sem 3D, troca pela versão com o espectro
    const img = pic?.querySelector('img')
    if (img && !live) img.src = '/midia/prisma/prisma-mobile.webp'
    // no mesmo passo, antes do próximo quadro: senão o casco pinta sem a imagem e o texto dele pula
    document.getElementById('shell')?.remove()
  }, [adopt, live])

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      // o scroll pelo hero abre o espectro
      gsap.to(stage, {
        open: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: reduced ? false : 0.6 },
      })
      // saindo do hero: o prisma gira, o espectro intensifica e então esmaece (sem isso com movimento reduzido)
      if (!reduced)
        gsap.fromTo(stage, { heroExit: 0 }, { heroExit: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 } })
      if (!reduced) {
        gsap.to(content.current, {
          yPercent: -12,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: '2% top', end: '40% top', scrub: true },
        })
      }
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="inicio"
      ref={root}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col justify-start overflow-x-clip px-5 pt-28 pb-16 sm:justify-end sm:pb-24 sm:px-8 lg:min-h-[115vh] lg:justify-center lg:px-20 lg:pt-24 lg:pb-24 xl:px-28"
    >
      {adopt && <div ref={stillSlot} className="contents" />}
      {mode === 'lite' && !adopt && (
        <picture
          className="hero-still pointer-events-none relative -mx-5 -mt-28 mb-1 block h-[42svh] sm:absolute sm:top-1/2 sm:right-0 sm:-z-10 sm:m-0 sm:aspect-[16/10] sm:h-auto sm:w-[78%] sm:-translate-y-1/2 lg:w-[72%]"
        >
          <source media="(min-width: 700px)" srcSet="/midia/prisma/prisma-desktop.webp" />
          <img
            src="/midia/prisma/prisma-mobile.webp"
            alt=""
            className="h-full w-full object-cover object-top sm:object-center"
            fetchPriority="high"
          />
        </picture>
      )}

      <div ref={content} className="relative max-w-[1400px]">
        <p className="eyebrow hero-in mb-7 hidden text-[var(--ink-faint)] sm:block" style={delay(0.05)}>
          Sites e sistemas com IA para negócios locais
        </p>

        <h1 id="hero-title" className="hero-h display text-[clamp(44px,7.4vw,124px)]">
          <span className="line-mask">
            <span className="hero-in block" style={delay(0.12)}>
              Seu cliente já está
            </span>
          </span>
          <span className="line-mask">
            <span className="hero-in block" style={delay(0.2)}>
              procurando.
            </span>
          </span>
          <span className="line-mask">
            <em className="hero-in block text-[var(--ink-soft)]" style={delay(0.3)}>
              Só não está te
            </em>
          </span>
          <span className="line-mask">
            <em className="hero-in block text-[var(--ink-soft)]" style={delay(0.38)}>
              encontrando.
            </em>
          </span>
        </h1>

        <p className="hero-copy hero-in mt-9 max-w-[430px] text-[17px] leading-[1.6] text-[var(--ink-soft)]" style={delay(0.55)}>
          A Allaska cria o site e o sistema com IA por trás dele: quem procura te acha, é atendido na hora e vira
          cliente. Demo pronta em 48h, e você só paga se aprovar.
        </p>

        <div className="hero-actions hero-in mt-9 flex flex-wrap items-center gap-x-9 gap-y-5" style={delay(0.66)}>
          <Magnetic>
            <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid" data-umami-event="hero-cta">
              <span className="btn-dot" aria-hidden="true" />
              Ver minha demo grátis
            </a>
          </Magnetic>
          <a href="#como-funciona" className="link-line text-[15px] font-semibold" data-umami-event="hero-como-funciona">
            Como funciona
          </a>
        </div>
      </div>
    </section>
  )
}
