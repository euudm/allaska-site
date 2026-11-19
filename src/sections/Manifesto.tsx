import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/device'

/** Trechos entre asteriscos saem em itálico. */
const TEXT =
  'Todo dia, alguém na sua cidade pesquisa exatamente o que você vende. Abre o Google, o Instagram, o WhatsApp. E encontra o seu concorrente. Não porque ele é melhor, mas porque *ele aparece.* Seu cliente já está procurando. *Falta ele te encontrar.*'

type Word = { text: string; italic: boolean }

function splitWords(text: string): Word[] {
  const out: Word[] = []
  let italic = false
  for (const raw of text.split(' ')) {
    let w = raw
    const opens = w.startsWith('*')
    if (opens) {
      italic = true
      w = w.slice(1)
    }
    const closes = w.endsWith('*')
    if (closes) w = w.slice(0, -1)
    out.push({ text: w, italic })
    if (closes) italic = false
  }
  return out
}

const WORDS = splitWords(TEXT)

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const words = root.current?.querySelectorAll<HTMLElement>('[data-word]')
    if (!words?.length) return
    if (prefersReducedMotion()) {
      words.forEach((w) => (w.style.opacity = '1'))
      return
    }
    const mm = gsap.matchMedia()
    // desktop: seção presa, as palavras acendem enquanto ela segura a tela
    mm.add('(min-width: 1024px)', () => {
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.4 } },
      )
    })
    // celular: fluxo normal, as palavras acendem enquanto o parágrafo atravessa a tela
    mm.add('(max-width: 1023px)', () => {
      const text = root.current?.querySelector('[data-text]')
      gsap.fromTo(
        words,
        { opacity: 0.18 },
        { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: text, start: 'top 85%', end: 'bottom 45%', scrub: 0.4 } },
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="manifesto" ref={root} aria-labelledby="manifesto-title" className="relative lg:h-[260svh]">
      <div className="flex items-center px-5 py-24 sm:px-8 lg:sticky lg:top-0 lg:h-[100svh] lg:px-20 lg:py-0 xl:px-28">
        <div className="mx-auto w-full max-w-[1180px]">
          <h2 id="manifesto-title" className="eyebrow mb-8 text-[var(--ink-faint)] sm:mb-10">
            O problema
          </h2>
          {/* texto completo para leitores de tela; a versão palavra por palavra é só visual */}
          <p className="sr-only">{TEXT.replaceAll('*', '')}</p>
          <p aria-hidden="true" data-text className="display text-[clamp(32px,4.6vw,72px)] leading-[1.08] tracking-[-0.03em]">
            {WORDS.map((w, i) => (
              <Fragment key={i}>
                <span data-word style={{ opacity: 0.15 }} className={w.italic ? 'italic' : undefined}>
                  {w.text}
                </span>{' '}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
