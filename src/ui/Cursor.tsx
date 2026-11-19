import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/device'

const INTERACTIVE = 'a, button, [data-cursor]'

/** Círculo que segue o mouse e cresce sobre links e botões. Só com mouse de verdade. */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    if (!fine || prefersReducedMotion()) return
    const html = document.documentElement
    html.classList.add('has-cursor')

    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3.out' })
    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.1, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.1, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      ringX(e.clientX)
      ringY(e.clientY)
      dotX(e.clientX)
      dotY(e.clientY)
      root.current?.classList.remove('is-hidden')
    }
    const over = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE)
      root.current?.classList.toggle('is-hover', Boolean(hit))
    }
    const leave = () => root.current?.classList.add('is-hidden')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [fine])

  // tela de toque: o cursor nem entra na página
  if (!fine) return null

  return (
    <div ref={root} className="cursor is-hidden" aria-hidden="true">
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}
