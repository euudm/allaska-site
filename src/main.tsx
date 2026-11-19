import './index.css'

/**
 * No celular o casco estático do index.html já mostra o hero; a aplicação carrega
 * depois do primeiro quadro, fora do caminho crítico (melhor FCP/LCP).
 * No desktop o loader cobre a entrada, então carrega direto.
 */
const start = () => import('./boot').then((m) => m.boot())

const shellVisible = document.getElementById('shell') && window.matchMedia('(pointer: coarse)').matches
if (shellVisible) {
  // depois do load (imagem, CSS e fontes já chegaram) e com a thread livre
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 1))
  // espera o load e o registro do LCP (a imagem do casco pintada), aí carrega a aplicação
  let loaded = document.readyState === 'complete'
  let lcp = false
  let started = false
  const go = () => {
    if (started || !loaded || !lcp) return
    started = true
    idle(start)
  }
  if (!loaded) window.addEventListener('load', () => ((loaded = true), go()), { once: true })
  try {
    new PerformanceObserver(() => ((lcp = true), go())).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    lcp = true
  }
  // segurança: se algo não disparar, carrega mesmo assim
  setTimeout(() => ((loaded = lcp = true), go()), 3500)
  go()
} else start()
