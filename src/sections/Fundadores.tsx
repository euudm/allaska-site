import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { INSTAGRAM } from '../lib/links'
import { prefersReducedMotion } from '../lib/device'

const FOUNDERS = [
  {
    name: 'Diego de Moraes',
    role: 'Fundador · Desenvolvimento e estratégia',
    photo: '/midia/fundadores/diego-de-moraes.webp',
    bio: 'Desenvolve os sites e os sistemas com IA da Allaska, do código à estratégia. O foco é um só: fazer o negócio aparecer para quem já está procurando o que ele oferece.',
    quote: 'Não construo sites. Construo sistemas que fazem negócios aparecerem para quem já quer comprar.',
    insta: INSTAGRAM.diego,
    handle: '@euudm',
  },
  {
    name: 'Lucka Montino',
    role: 'Fundador · Marketing e audiovisual',
    photo: '/midia/fundadores/lucka-montino.webp',
    bio: 'Cuida da estratégia de captação e do conteúdo audiovisual, do roteiro à distribuição. Já produziu mais de 50 vídeos que somaram 300 mil visualizações em menos de dois meses.',
    quote: 'Estar no campo de batalha é o que me dá precisão. Cada peça tem estratégia, intenção e resultado.',
    insta: INSTAGRAM.lucka,
    handle: '@luckamontino',
  },
]

export default function Fundadores() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) {
      el?.querySelectorAll('.founder-photo').forEach((p) => p.classList.add('is-color'))
      return
    }
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('.founder-frame').forEach((frame) => {
        const img = frame.querySelector('img')
        // revelação por máscara: a foto sobe de dentro do quadro
        gsap
          .timeline({ scrollTrigger: { trigger: frame, start: 'top 82%', once: true } })
          .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' })
          .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0)
      })
      // em tela de toque não existe hover: a foto ganha cor quando passa pelo centro
      if (!window.matchMedia('(pointer: fine)').matches) {
        el.querySelectorAll<HTMLElement>('.founder-photo').forEach((photo) => {
          gsap.to(photo, {
            scrollTrigger: {
              trigger: photo,
              start: 'top 60%',
              end: 'bottom 40%',
              toggleClass: 'is-color',
            },
          })
        })
      }
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="fundadores" ref={root} aria-labelledby="fundadores-title" className="relative px-5 pt-20 pb-20 sm:px-8 lg:px-20 lg:pt-40 lg:pb-40 xl:px-28">
      <div className="mx-auto max-w-[1280px]">
        <p className="eyebrow text-[var(--ink-faint)]">Fundadores</p>
        <h2 id="fundadores-title" className="display mt-6 text-[clamp(44px,6.2vw,104px)]">
          Dois fundadores.
          <br />
          <em className="text-[var(--ink-soft)]">Uma obsessão: resultado.</em>
        </h2>

        <div className="mt-14 grid gap-16 lg:mt-28 lg:grid-cols-2 lg:gap-16">
          {FOUNDERS.map((f, i) => (
            <article key={f.name} className={i === 1 ? 'lg:mt-40' : undefined}>
              <div className="founder-photo group">
                <div className="founder-frame aspect-[4/5] overflow-hidden rounded-[20px] bg-[var(--color-graphite)]">
                  <img src={f.photo} alt={`Foto de ${f.name}`} loading="lazy" className="h-full w-full object-cover object-[center_12%]" />
                </div>
              </div>
              <p className="mt-8 text-[13px] font-semibold lg:text-[12px] tracking-[0.14em] text-[var(--ink-faint)] uppercase">{f.role}</p>
              <h3 className="display mt-3 text-[clamp(40px,4vw,64px)]">{f.name}</h3>
              <p className="mt-5 max-w-[480px] text-[var(--ink-soft)]">{f.bio}</p>
              <blockquote className="display mt-8 max-w-[500px] border-l border-[var(--line)] pl-6 text-[clamp(22px,2vw,28px)] leading-[1.25] italic">
                “{f.quote}”
              </blockquote>
              <a href={f.insta} target="_blank" rel="noopener" className="link-line mt-8 inline-flex items-center gap-2 text-[14px] font-semibold" data-umami-event={`instagram-${f.handle.slice(1)}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
                </svg>
                {f.handle}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
