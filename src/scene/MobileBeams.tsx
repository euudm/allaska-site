import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SPECTRUM, stage } from '../lib/stage'

/** diagonal dos feixes: a mesma do feixe branco que entra no prisma (de cima à esquerda para baixo à direita) */
const ANGLE = (28 * Math.PI) / 180
const COLORS = [...SPECTRUM, '#f2f0eb', '#f2f0eb']
const COUNT = 20

type Beam = {
  /** distância perpendicular ao centro da tela, em fração da diagonal */
  p: number
  /** posição ao longo da diagonal, em fração da diagonal */
  s: number
  /** comprimento, em fração da diagonal */
  len: number
  /** quanto a rolagem empurra este feixe (profundidade) */
  depth: number
  /** deriva lenta própria, em fração da diagonal por segundo */
  drift: number
  color: string
  alpha: number
  width: number
}

/** sorteio com semente fixa: o desenho é o mesmo a cada visita */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function makeBeams(): Beam[] {
  const r = rng(7)
  return Array.from({ length: COUNT }, (_, i) => ({
    p: -0.55 + (1.1 * (i + r() * 0.8)) / COUNT,
    s: r() * 2 - 1,
    len: 0.5 + r() * 0.65,
    depth: 0.35 + r() * 0.9,
    drift: 0.006 + r() * 0.012,
    color: COLORS[i % COLORS.length],
    alpha: 0.22 + r() * 0.16,
    width: 1 + r() * 1,
  }))
}

/**
 * Celular: feixes finos de luz nas cores do espectro cruzando a tela na diagonal, numa camada 2D fixa
 * atrás do conteúdo. Deslizam com a rolagem (cada um numa profundidade), esticam e brilham mais quando a
 * rolagem é rápida, e se apagam no topo e onde o prisma 3D está em destaque.
 */
export default function MobileBeams() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    const beams = makeBeams()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let lastY = window.scrollY
    let speed = 0
    let time = 0
    let drawn = true
    const dx = Math.cos(ANGLE)
    const dy = Math.sin(ANGLE)

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(0.05, deltaMs / 1000)
      time += reduced ? 0 : dt
      const y = window.scrollY
      // velocidade da rolagem suavizada, em telas por segundo
      const v = Math.abs(y - lastY) / Math.max(1, h) / Math.max(dt, 0.001)
      lastY = y
      speed += (Math.min(v, 4) - speed) * 0.12

      // some no topo (a entrada do prisma é no escuro) e onde o prisma está em destaque
      const leaveHero = Math.min(1, Math.max(0, (y - h * 0.35) / (h * 0.5)))
      const fade = leaveHero * (1 - stage.mobile.vis * 0.9)
      if (fade < 0.01) {
        if (drawn) {
          ctx.clearRect(0, 0, el.width, el.height)
          drawn = false
        }
        return
      }
      drawn = true

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const diag = Math.hypot(w, h)
      const cx = w / 2
      const cy = h / 2
      const stretch = 1 + speed * 0.35
      const boost = 1 + speed * 0.6

      for (const b of beams) {
        // posição ao longo da diagonal: a rolagem empurra (com profundidade) e o tempo deriva; dá a volta
        let s = b.s + (y / diag) * b.depth * 0.9 + time * b.drift
        s = ((((s + 1.2) % 2.4) + 2.4) % 2.4) - 1.2
        const len = b.len * stretch * diag
        const mx = cx - dy * b.p * diag + dx * s * diag
        const my = cy + dx * b.p * diag + dy * s * diag
        const x0 = mx - (dx * len) / 2
        const y0 = my - (dy * len) / 2
        const x1 = mx + (dx * len) / 2
        const y1 = my + (dy * len) / 2
        const a = Math.min(0.95, b.alpha * boost) * fade

        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(0.55, b.color)
        g.addColorStop(0.92, b.color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.strokeStyle = g
        ctx.lineCap = 'round'
        // halo largo e fraco + núcleo fino
        ctx.globalAlpha = a * 0.3
        ctx.lineWidth = b.width * 8
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
        ctx.globalAlpha = a
        ctx.lineWidth = b.width
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden="true" className="mobile-beams" />
}
