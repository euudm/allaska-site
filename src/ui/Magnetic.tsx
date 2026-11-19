import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/device'

/** Puxa o filho em direção ao cursor quando ele chega perto. */
export default function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const el = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = el.current
    if (!node || !window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const x = gsap.quickTo(node, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    const y = gsap.quickTo(node, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * strength)
      y((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const reset = () => {
      x(0)
      y(0)
    }
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', reset)
    return () => {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', reset)
    }
  }, [strength])

  return (
    <span ref={el} className="inline-block will-change-transform">
      {children}
    </span>
  )
}
