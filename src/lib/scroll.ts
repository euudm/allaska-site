import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { stage } from './stage'
import { prefersReducedMotion } from './device'

gsap.registerPlugin(ScrollTrigger)
// no celular a barra de endereço some e aparece ao rolar: não recalcular tudo por causa disso
ScrollTrigger.config({ ignoreMobileResize: true })

export let lenis: Lenis | null = null

/** Liga Lenis + GSAP no mesmo relógio e mantém o ponteiro suavizado. */
export function useSmoothScroll() {
  useEffect(() => {
    // no toque o scroll nativo é melhor e mais leve
    if (!prefersReducedMotion() && window.matchMedia('(pointer: fine)').matches) {
      lenis = new Lenis({ duration: 1.2, smoothWheel: true, touchMultiplier: 1.4, anchors: { duration: 1.6 } })
      lenis.on('scroll', ScrollTrigger.update)
    }

    const tick = (time: number) => {
      lenis?.raf(time * 1000)
      const p = stage.pointer
      const s = stage.pointerSmooth
      s.x += (p.x - s.x) * 0.05
      s.y += (p.y - s.y) * 0.05
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onPointer = (e: PointerEvent) => {
      // só mouse: no toque o dedo rolando a página não deve mexer no prisma
      if (e.pointerType !== 'mouse') return
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      stage.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onPointer)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
