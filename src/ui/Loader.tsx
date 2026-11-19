import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/device'

/**
 * O "A" se desenha em linhas e some. Máximo de 1,5 s, e espera as fontes
 * para o hero não aparecer com a fonte errada.
 */
export default function Loader({ enabled = true, hold = false }: { enabled?: boolean; hold?: boolean }) {
  const [done, setDone] = useState(!enabled)
  const [basics, setBasics] = useState(false)

  // fontes + tempo mínimo da animação do "A"
  useEffect(() => {
    const html = document.documentElement
    // sem loader (celular/modo leve): o conteúdo aparece direto, melhor para o LCP
    if (!enabled) {
      html.classList.add('is-ready', 'no-intro')
      return
    }
    const minTime = prefersReducedMotion() ? 0 : 1150
    const start = performance.now()
    let alive = true
    document.fonts?.ready.then(() => {
      const wait = Math.max(0, minTime - (performance.now() - start))
      window.setTimeout(() => alive && setBasics(true), wait)
    })
    // teto: a página nunca fica presa no loader
    const cap = window.setTimeout(() => alive && (setBasics(true), setDone(true)), 3500)
    return () => {
      alive = false
      window.clearTimeout(cap)
    }
  }, [enabled])

  // a cena 3D compila os shaders nos primeiros quadros: melhor isso acontecer por trás do loader
  useEffect(() => {
    if (enabled && basics && !hold) setDone(true)
  }, [enabled, basics, hold])

  useEffect(() => {
    if (done && enabled) document.documentElement.classList.add('is-ready')
  }, [done, enabled])

  if (!enabled) return null

  return (
    <div className={`loader ${done ? 'is-done' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 158 152" width="64" height="62">
        <polygon points="78,3 155,150 100,132 53,62" />
        <polygon points="42,80 75,142 2,148" />
      </svg>
    </div>
  )
}
