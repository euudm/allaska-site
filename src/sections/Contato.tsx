import { whatsapp, INSTAGRAM } from '../lib/links'
import type { SceneMode } from '../lib/device'
import { LogoMark } from '../ui/Logo'
import Magnetic from '../ui/Magnetic'

const EMAIL = 'allaska1503@gmail.com'

const FAQ = [
  {
    q: 'Quanto tempo leva?',
    a: 'A demo fica pronta em 48h. Aprovou, o site entra no ar em cerca de 5 dias úteis. Os sistemas com IA dependem do que o seu negócio precisa, e o prazo a gente combina na conversa de diagnóstico.',
  },
  {
    q: 'Quanto custa?',
    a: 'Depende do que faz sentido para você. Cada projeto é orçado sob medida, depois da conversa de diagnóstico. E você só paga se aprovar a demo.',
  },
  {
    q: 'Preciso já ter um site?',
    a: 'Não. A gente cria do zero. Se você já tem um, a gente olha com você se vale melhorar o que existe ou começar de novo.',
  },
  {
    q: 'Funciona para o meu nicho?',
    a: 'A Allaska trabalha com negócios locais que dependem de ser encontrados: clínicas, academias, barbearias, escritórios, imobiliárias. Se não fizer sentido para o seu caso, a gente fala isso com todas as letras no diagnóstico.',
  },
]

export default function Contato({ mode }: { mode: SceneMode }) {
  return (
    <>
      <section id="contato" aria-labelledby="contato-title" className="relative flex min-h-[100svh] flex-col justify-end overflow-x-clip px-5 pt-28 pb-24 sm:px-8 lg:justify-center lg:px-20 xl:px-28">
        {mode === 'lite' && (
          <picture className="hero-still pointer-events-none relative -mx-5 -mt-28 mb-1 block h-[42svh] sm:absolute sm:top-1/2 sm:right-0 sm:-z-10 sm:m-0 sm:aspect-[16/10] sm:h-auto sm:w-[78%] sm:-translate-y-1/2 lg:w-[72%]">
            <source media="(min-width: 700px)" srcSet="/midia/prisma/prisma-desktop.webp" />
            <img src="/midia/prisma/prisma-mobile.webp" alt="" loading="lazy" className="h-full w-full object-cover object-top sm:object-center" />
          </picture>
        )}
        <div className="relative max-w-[760px]">
          <p className="eyebrow text-[var(--ink-faint)]">Próximo passo</p>
          <h2 id="contato-title" className="display mt-7 text-[clamp(48px,6.4vw,104px)]">
            Seu cliente já está procurando.
            <br />
            <em className="text-[var(--ink-soft)]">Faça ele te encontrar.</em>
          </h2>
          <ul className="mt-10 flex flex-col gap-3 text-[17px] text-[var(--ink-soft)]">
            {['Demo pronta em 48h', 'Você só paga se aprovar', 'Site no ar em cerca de 5 dias'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M2.5 7.3 5.6 10.2 11.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Magnetic>
              <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid h-[64px] px-9 text-[16px]" data-umami-event="whatsapp-cta-final">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3l-4.5 1.5Z" strokeLinejoin="round" />
                  <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2L9 9.5Z" strokeLinejoin="round" />
                </svg>
                Ver minha demo grátis no WhatsApp
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="relative px-5 pt-24 pb-28 sm:px-8 lg:px-20 lg:pt-32 lg:pb-36 xl:px-28">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow text-[var(--ink-faint)]">Perguntas frequentes</p>
            <h2 id="faq-title" className="display mt-6 text-[clamp(40px,4.6vw,72px)]">
              Antes de
              <br />
              <em className="text-[var(--ink-soft)]">chamar a gente.</em>
            </h2>
          </div>
          <div className="border-t border-[var(--line)]">
            {FAQ.map((f) => (
              <details key={f.q} className="faq group border-b border-[var(--line)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-[clamp(20px,1.8vw,26px)] font-medium tracking-[-0.015em]">
                  {f.q}
                  <span className="faq-icon relative h-4 w-4 shrink-0" aria-hidden="true" />
                </summary>
                <p className="max-w-[620px] pb-8 text-[var(--ink-soft)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-[var(--line)] px-5 pt-20 pb-10 sm:px-8 lg:px-20 xl:px-28">
        <div className="mx-auto grid max-w-[1280px] gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#inicio" className="flex min-h-[44px] items-center gap-2.5 self-start text-inherit no-underline" aria-label="Allaska, voltar ao início">
              <LogoMark className="h-[22px] w-[23px]" />
              <span className="text-[18px] font-semibold tracking-[-0.03em]">Allaska</span>
            </a>
            <p className="mt-5 max-w-[340px] text-[15px] text-[var(--ink-soft)]">Sites e sistemas com IA para negócios locais que querem ser encontrados.</p>
          </div>
          <div className="flex flex-col gap-3 text-[15px]">
            <p className="eyebrow mb-2 text-[var(--ink-faint)]">Contato</p>
            <a href={whatsapp()} target="_blank" rel="noopener" className="link-line self-start" data-umami-event="whatsapp-rodape">
              WhatsApp (11) 94064-3165
            </a>
            <a href={`mailto:${EMAIL}`} className="link-line self-start">
              {EMAIL}
            </a>
          </div>
          <div className="flex flex-col gap-3 text-[15px]">
            <p className="eyebrow mb-2 text-[var(--ink-faint)]">Instagram</p>
            <a href={INSTAGRAM.diego} target="_blank" rel="noopener" className="link-line self-start" data-umami-event="instagram-diego">
              @euudm
            </a>
            <a href={INSTAGRAM.lucka} target="_blank" rel="noopener" className="link-line self-start" data-umami-event="instagram-lucka">
              @luckamontino
            </a>
          </div>
        </div>

        <p aria-hidden="true" className="display pointer-events-none mt-20 text-center text-[clamp(90px,21vw,360px)] leading-[0.8] tracking-[-0.05em] text-[rgb(242_240_235/0.05)] select-none">
          Allaska
        </p>

        <div className="mx-auto mt-10 flex max-w-[1280px] flex-col gap-2 text-[13px] text-[var(--ink-faint)] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Allaska. Todos os direitos reservados.</span>
        </div>
      </footer>
    </>
  )
}
