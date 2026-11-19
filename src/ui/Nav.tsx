import { useEffect, useRef, useState } from 'react'
import { LogoMark } from './Logo'
import Magnetic from './Magnetic'
import { INSTAGRAM, whatsapp } from '../lib/links'

const LINKS = [
  { href: '#espectro', label: 'Soluções', event: 'nav-solucoes' },
  { href: '#como-funciona', label: 'Como funciona', event: 'nav-como-funciona' },
  { href: '#projetos', label: 'Projetos', event: 'nav-projetos' },
  { href: '#fundadores', label: 'Fundadores', event: 'nav-sobre' },
]

/** Menu em tela cheia do celular (abaixo de 768px). No desktop nada disso aparece. */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const first = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    html.classList.add('menu-open')
    first.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      html.classList.remove('menu-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div
      id="menu-mobile"
      className={`mobile-menu md:hidden ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
    >
      <nav aria-label="Seções" className="flex flex-1 flex-col justify-center px-6">
        <ol className="flex flex-col gap-1">
          {LINKS.map((l, i) => (
            <li key={l.href} className="menu-item" style={{ ['--i' as string]: i }}>
              <a
                ref={i === 0 ? first : undefined}
                href={l.href}
                onClick={onClose}
                data-umami-event={`menu-${l.event}`}
                className="flex min-h-[64px] items-baseline gap-4 py-2 text-inherit no-underline"
              >
                <span className="text-[13px] font-semibold text-[var(--ink-faint)] tabular-nums">0{i + 1}</span>
                <span className="display text-[clamp(44px,13vw,60px)]">{l.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="menu-item flex flex-col gap-5 px-6 pb-[calc(28px+env(safe-area-inset-bottom))]" style={{ ['--i' as string]: LINKS.length }}>
        <a href={whatsapp()} target="_blank" rel="noopener" onClick={onClose} className="btn btn-solid w-full justify-center" data-umami-event="menu-whatsapp">
          <span className="btn-dot" aria-hidden="true" />
          Ver minha demo grátis
        </a>
        <div className="flex gap-6 text-[15px] text-[var(--ink-soft)]">
          <a href={INSTAGRAM.diego} target="_blank" rel="noopener" className="flex min-h-[44px] items-center text-inherit no-underline">
            @euudm
          </a>
          <a href={INSTAGRAM.lucka} target="_blank" rel="noopener" className="flex min-h-[44px] items-center text-inherit no-underline">
            @luckamontino
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="nav-veil fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-3 sm:px-8 sm:py-6 lg:px-12">
        <a href="#inicio" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center gap-2.5 text-inherit no-underline" aria-label="Allaska, voltar ao início">
          <LogoMark className="h-[21px] w-[22px]" />
          <span className="text-[17px] font-semibold tracking-[-0.03em]">Allaska</span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-umami-event={l.event} className="link-line text-[14px] font-medium tracking-[-0.01em] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic strength={0.2}>
            <a
              href={whatsapp()}
              target="_blank"
              rel="noopener"
              data-umami-event="nav-whatsapp"
              className={`flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-4 text-[13.5px] font-semibold tracking-[-0.01em] text-inherit no-underline transition-[colors,opacity] hover:border-[var(--ink)] md:py-2.5 ${open ? 'max-md:pointer-events-none max-md:opacity-0' : ''}`}
            >
              <span className="sm:hidden">Demo grátis</span>
              <span className="hidden sm:inline">Ver minha demo grátis</span>
            </a>
          </Magnetic>
          <button
            type="button"
            className={`burger md:hidden ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
