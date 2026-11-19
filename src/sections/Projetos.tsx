import { PROJECTS } from '../data/projects'
import BrowserMockup from '../ui/BrowserMockup'

export default function Projetos() {
  return (
    <section id="projetos" aria-labelledby="projetos-title" className="relative px-5 pt-20 pb-20 sm:px-8 lg:px-20 lg:pt-40 lg:pb-40 xl:px-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-[var(--ink-faint)]">Projetos</p>
            <h2 id="projetos-title" className="display mt-6 text-[clamp(44px,6.2vw,104px)]">
              Sites que
              <br />
              <em className="text-[var(--ink-soft)]">estão no ar.</em>
            </h2>
          </div>
          <p className="max-w-[360px] text-[var(--ink-soft)]">
            <span className="pointer-coarse:hidden">Passe o mouse para ver a página inteira.</span>
            <span className="hidden pointer-coarse:inline">Cada página rola sozinha dentro da janela.</span> Todos são clientes reais, com o site funcionando agora.
          </p>
        </div>

        <ol className="mt-14 flex flex-col gap-16 lg:mt-28 lg:gap-36">
          {PROJECTS.map((p, i) => (
            <li key={p.slug} className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-12 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener"
                className="block min-w-0 lg:col-span-8"
                data-umami-event={`projeto-${p.slug}`}
                aria-label={`${p.domain}, site da ${p.name}, abre em nova aba`}
              >
                <BrowserMockup image={`/midia/projetos/${p.slug}.webp`} alt="" domain={p.domain} />
              </a>
              <div className="min-w-0 lg:col-span-4">
                <span className="outline-num block text-[clamp(72px,7vw,120px)]" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3 className="display mt-2 text-[clamp(36px,3.4vw,56px)]">{p.name}</h3>
                <p className="mt-3 text-[13px] font-semibold tracking-[0.04em] text-[var(--ink-faint)] uppercase">{p.niche}</p>
                <p className="mt-6 max-w-[360px] text-[var(--ink-soft)]">{p.description}</p>
                <a href={p.url} target="_blank" rel="noopener" className="link-line mt-8 inline-flex items-center gap-2 text-[15px] font-semibold" data-umami-event={`projeto-${p.slug}-link`}>
                  Ver o site no ar
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d="M3 9 9 3M4 3h5v5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
