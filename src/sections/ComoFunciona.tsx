import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SOLUTIONS } from '../data/solutions'
import { prefersReducedMotion } from '../lib/device'
import { LogoMark } from '../ui/Logo'

type Msg = { from: 'cliente' | 'allaska'; text: string; time: string }

/** Conversa ilustrativa de diagnóstico (exemplo, não é um cliente real). */
const CHAT: Msg[] = [
  { from: 'cliente', text: 'Oi! Tenho uma clínica de estética e quase ninguém me acha no Google.', time: '09:12' },
  { from: 'allaska', text: 'Oi! Vamos entender isso. Hoje os seus clientes chegam como?', time: '09:13' },
  { from: 'cliente', text: 'Quase tudo por indicação. Já tentei anúncio e não deu certo.', time: '09:15' },
  { from: 'allaska', text: 'Faz sentido. Me passa o nome da clínica que eu vejo como você aparece hoje.', time: '09:15' },
  { from: 'allaska', text: 'Em 48h te mando uma demo do que dá para fazer. Sem compromisso.', time: '09:16' },
]

/** No passo 2, o diagnóstico acende só o que faz sentido para esse negócio. */
const PICKED = [0, 3, 4]

const STEPS = [
  {
    n: '01',
    title: ['A gente entende', 'antes de entregar.'],
    text: 'Antes de qualquer proposta, uma conversa direta sobre o seu negócio: onde está o gargalo, o que já foi tentado, o que falta. Sem formulário, sem pacote pronto.',
  },
  {
    n: '02',
    title: ['Solução feita', 'para você.'],
    text: 'Com o diagnóstico em mãos, a gente monta só o que faz sentido para o seu negócio. Você vê a demo funcionando em 48h e só paga se aprovar.',
  },
  {
    n: '03',
    title: ['A gente fica.', 'Não some.'],
    text: 'Depois que tudo entra no ar, a Allaska acompanha de perto: ajustes, relatório do que está funcionando e o próximo passo. Parceiro de longo prazo, não fornecedor de uma entrega só.',
  },
]

const TIMELINE = [
  { when: 'Dia 1', what: 'Site e sistema no ar' },
  { when: 'Primeira semana', what: 'Ajustes finos com você' },
  { when: 'Todo mês', what: 'Relatório do que funcionou' },
  { when: 'Sempre', what: 'WhatsApp direto com quem fez' },
]

function Chat() {
  return (
    <div className="w-full max-w-[360px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--color-graphite)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-bone)] text-[var(--color-void)]">
          <LogoMark className="h-[14px] w-[15px]" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold">Allaska</span>
          <span className="text-[12.5px] text-[var(--ink-faint)] lg:text-[11.5px]">online</span>
        </span>
      </div>
      <div className="flex min-h-[330px] flex-col gap-2.5 px-4 py-5">
        {CHAT.map((m, i) => (
          <div
            key={i}
            data-msg
            className={`max-w-[84%] rounded-[18px] px-4 py-2.5 text-[13.5px] leading-[1.45] ${
              m.from === 'cliente'
                ? 'self-start rounded-bl-[6px] bg-[#1d1d24] text-[var(--ink)]'
                : 'self-end rounded-br-[6px] bg-[var(--color-bone)] text-[var(--color-void)]'
            }`}
          >
            {m.text}
            <span className={`mt-1 flex items-center justify-end gap-1 text-[11.5px] lg:text-[10.5px] ${m.from === 'cliente' ? 'text-[var(--ink-faint)]' : 'text-[rgb(7_7_10/0.5)]'}`}>
              {m.time}
              {m.from === 'allaska' && (
                <svg width="15" height="9" viewBox="0 0 15 9" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <path d="M1 4.8 3.8 7.5 9.5 1.5M6.2 7.5 12.8 1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Picker() {
  return (
    <div className="w-full max-w-[400px] rounded-[24px] border border-[var(--line)] bg-[var(--color-graphite)] p-6">
      <p className="eyebrow text-[var(--ink-faint)]">Diagnóstico</p>
      <p className="mt-2 text-[17px] font-semibold tracking-[-0.01em]">Clínica de estética</p>
      <ul className="mt-5 flex flex-col">
        {SOLUTIONS.map((s, i) => {
          const on = PICKED.includes(i)
          return (
            <li key={s.n} data-pick={on ? '' : undefined} className="flex items-center gap-3 border-t border-[var(--line)] py-2.5 text-[13.5px]" style={{ opacity: 0.3 }}>
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: s.color, boxShadow: on ? `0 0 10px ${s.color}` : 'none' }} />
              <span className="flex-1">{s.name}</span>
              {on && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M2.5 7.3 5.6 10.2 11.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[12.5px] text-[var(--ink-faint)]">3 de 6, porque é o que esse negócio precisa agora.</p>
    </div>
  )
}

function Timeline() {
  return (
    <ol className="relative w-full max-w-[380px] border-l border-[var(--line)] pl-8">
      {TIMELINE.map((t) => (
        <li key={t.when} data-node className="relative pb-9 last:pb-0">
          <span className="absolute top-[7px] -left-[36.5px] h-[8px] w-[8px] rounded-full bg-[var(--color-bone)] shadow-[0_0_12px_rgba(242,240,235,0.6)]" />
          <p className="eyebrow text-[var(--ink-faint)]">{t.when}</p>
          <p className="display mt-1.5 text-[28px] leading-[1.1]">{t.what}</p>
        </li>
      ))}
    </ol>
  )
}

const VISUALS = [<Chat key="chat" />, <Picker key="picker" />, <Timeline key="timeline" />]

export default function ComoFunciona() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const msgs = el.querySelectorAll('[data-msg]')
    const picks = el.querySelectorAll('[data-pick]')
    const nodes = el.querySelectorAll('[data-node]')

    if (prefersReducedMotion()) {
      gsap.set([msgs, nodes], { opacity: 1 })
      gsap.set(picks, { opacity: 1 })
      return
    }

    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      // uma linha do tempo só, presa ao scroll: conversa, depois o trilho anda, depois os detalhes acendem
      const distance = () => (track.current ? track.current.scrollWidth - window.innerWidth : 0)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
      })
      // estado inicial explícito: fromTo com stagger dentro da timeline só escondia a primeira mensagem
      gsap.set(msgs, { opacity: 0, y: 14 })
      gsap.set(nodes, { opacity: 0.2 })
      tl.to(msgs, { opacity: 1, y: 0, duration: 0.04, stagger: 0.045 }, 0.02)
      tl.to(track.current, { x: () => -distance(), duration: 0.72 }, 0.28)
      tl.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
      tl.to(picks, { opacity: 1, duration: 0.05, stagger: 0.04 }, 0.58)
      tl.to(nodes, { opacity: 1, duration: 0.04, stagger: 0.035 }, 0.86)
    })
    // celular: tudo em fluxo vertical; cada coisa entra (fade + leve subida) quando aparece, sem depender de rolar junto
    mm.add('(max-width: 1023px)', () => {
      const enter = (targets: Element | NodeListOf<Element>, trigger: Element, opts: gsap.TweenVars = {}) =>
        gsap.fromTo(targets, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.18, ...opts, scrollTrigger: { trigger, start: 'top 85%', once: true } })
      el.querySelectorAll('[data-step-text]').forEach((t) => enter(t, t))
      if (msgs[0]) enter(msgs, msgs[0].parentElement!, { stagger: 0.35 })
      if (picks[0]) gsap.fromTo(picks, { opacity: 0.3 }, { opacity: 1, duration: 0.6, stagger: 0.25, scrollTrigger: { trigger: picks[0].parentElement!, start: 'top 75%', once: true } })
      if (nodes[0]) enter(nodes, nodes[0].parentElement!, { stagger: 0.2 })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="como-funciona" ref={root} aria-labelledby="como-title" className="relative lg:h-[420svh]">
      <div className="lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-hidden">
        <div className="flex items-end justify-between px-5 pt-20 sm:px-8 lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:px-20 lg:pt-28 xl:px-28">
          <h2 id="como-title" className="eyebrow text-[var(--ink-faint)]">
            Como funciona
          </h2>
          <span className="relative hidden h-px w-40 overflow-hidden bg-[var(--line)] lg:block" aria-hidden="true">
            <span ref={bar} className="absolute inset-0 origin-left bg-[var(--ink)]" />
          </span>
        </div>

        <div ref={track} className="flex flex-col will-change-transform lg:h-full lg:w-max lg:flex-row">
          {STEPS.map((s, i) => (
            <article
              key={s.n}
              className="relative grid gap-10 px-5 pt-10 pb-14 sm:px-8 lg:h-full lg:w-[100vw] lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-20 lg:py-0 xl:px-28"
            >
              <div className="relative" data-step-text>
                <span aria-hidden="true" className="outline-num pointer-events-none mb-2 block select-none text-[clamp(92px,13vw,210px)] lg:-ml-[0.04em]">
                  {s.n}
                </span>
                <h3 className="display relative text-[clamp(40px,5.6vw,92px)]">
                  {s.title[0]}
                  <br />
                  <em className="text-[var(--ink-soft)]">{s.title[1]}</em>
                </h3>
                <p className="relative mt-6 max-w-[460px] text-[17px] lg:mt-8 leading-[1.65] text-[var(--ink-soft)]">{s.text}</p>
              </div>
              <div className="flex justify-start lg:justify-center">{VISUALS[i]}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
