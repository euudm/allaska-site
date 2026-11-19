import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/device'

type Props = { image: string; alt: string; domain: string }

/**
 * Janela de navegador com a página do cliente dentro. No hover a página rola até o fim;
 * em tela de toque ela rola sozinha enquanto estiver visível. Tilt 3D sutil com o mouse.
 */
export default function BrowserMockup({ image, alt, domain }: Props) {
  const card = useRef<HTMLDivElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const [dist, setDist] = useState(0)

  // quanto a imagem pode rolar dentro da tela do mockup
  useEffect(() => {
    const measure = () => {
      if (!img.current || !screen.current) return
      setDist(Math.max(0, img.current.offsetHeight - screen.current.offsetHeight))
    }
    const node = img.current
    node?.addEventListener('load', measure)
    const ro = new ResizeObserver(measure)
    if (screen.current) ro.observe(screen.current)
    measure()
    return () => {
      node?.removeEventListener('load', measure)
      ro.disconnect()
    }
  }, [])

  // tilt: só com mouse de verdade
  useEffect(() => {
    const el = card.current
    if (!el || !window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    gsap.set(el, { transformPerspective: 1400 })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 7)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 5)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  // toque: rola sozinho em loop enquanto está na tela
  useEffect(() => {
    const el = screen.current
    if (!el || window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-autoscroll', e.isIntersecting), { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={card} className="mockup will-change-transform" style={{ ['--dist' as string]: `${dist}px`, ['--dur' as string]: `${Math.max(3, dist / 260)}s` }}>
      <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[#16161b] px-4 py-3">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(242_240_235/0.16)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(242_240_235/0.16)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(242_240_235/0.16)]" />
        </span>
        <span className="mx-auto flex min-w-0 max-w-[70%] items-center gap-2 rounded-full bg-[rgb(242_240_235/0.06)] px-4 py-1 text-[12px] text-[var(--ink-faint)]">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <rect x="1" y="5" width="8" height="6" rx="1.5" />
            <path d="M3 5V3.5a2 2 0 0 1 4 0V5" />
          </svg>
          <span className="min-w-0 truncate">{domain}</span>
        </span>
        <span className="hidden w-[42px] shrink-0 sm:block" aria-hidden="true" />
      </div>
      <div ref={screen} className="mockup-screen relative aspect-[16/10] overflow-hidden bg-[var(--color-graphite)]">
        <img ref={img} src={image} alt={alt} loading="lazy" decoding="async" className="mockup-page absolute top-0 left-0 w-full" />
      </div>
    </div>
  )
}
