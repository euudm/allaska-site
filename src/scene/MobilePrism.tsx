import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { stage } from '../lib/stage'
import { prefersReducedMotion } from '../lib/device'

const PrismCanvas = lazy(() => import('./PrismCanvas'))

/** limite da inclinação pelo giroscópio: ±12° */
const MAX_TILT = (12 * Math.PI) / 180
/** quantos graus de celular inclinado dão a inclinação máxima */
const RANGE = 28

/**
 * Os pontos da página onde o prisma "encaixa", na ordem em que aparecem.
 * Cada um é um espaço vazio no fluxo do texto (a imagem estática ou o leque 2D ficam ali como reserva).
 */
const SLOTS = [
  { key: 'hero', selector: '#inicio picture.hero-still' },
  { key: 'espectro', selector: '#espectro [data-prism-slot]' },
  { key: 'contato', selector: '#contato picture.hero-still' },
] as const

/** altura (fração da tela) onde o centro do prisma fica preso entre um ponto e outro */
const PIN = 0.21
/** quanto o prisma do topo é maior que o enquadramento padrão do espaço dele */
const HERO_ZOOM = 1.4
/** quanto (fração da tela) o prisma do topo desce em relação ao centro do espaço dele */
const HERO_DROP = 0.05
/** quanto de rolagem (fração da tela) o prisma leva para sumir depois de preso */
const FADE = 0.55

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Giroscópio: gamma (lado a lado) gira em Y, beta (frente e trás) inclina em X.
 * O primeiro ângulo lido vira o "neutro", e o neutro acompanha devagar o jeito que a pessoa segura o celular.
 * No iPhone a permissão é pedida no primeiro toque em qualquer lugar, sem aviso nosso.
 * Se não houver sensor ou a permissão for negada, nada acontece: fica só a animação contínua.
 */
function useGyro(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
    const target = { x: 0, y: 0 }
    let base: { beta: number; gamma: number } | null = null

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { beta: e.beta, gamma: e.gamma }
      // o neutro migra devagar: segurar o celular de outro jeito não deixa o prisma torto
      base.beta += (e.beta - base.beta) * 0.004
      base.gamma += (e.gamma - base.gamma) * 0.004
      const clamp = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v))
      target.y = clamp(((e.gamma - base.gamma) / RANGE) * MAX_TILT)
      target.x = clamp(((e.beta - base.beta) / RANGE) * MAX_TILT)
    }

    const listen = () => window.addEventListener('deviceorientation', onOrient, { passive: true })
    const DOE = window.DeviceOrientationEvent as IOSOrientation
    let askOnTouch: (() => void) | null = null
    if (typeof DOE.requestPermission === 'function') {
      // iOS: precisa vir de um toque do usuário
      askOnTouch = () => {
        DOE.requestPermission?.()
          .then((r) => r === 'granted' && listen())
          .catch(() => {})
      }
      document.addEventListener('touchend', askOnTouch, { once: true, passive: true })
      document.addEventListener('click', askOnTouch, { once: true, passive: true })
    } else listen()

    // suavização: nada de tremer com o ruído do sensor
    const tick = () => {
      stage.tilt.x += (target.x - stage.tilt.x) * 0.08
      stage.tilt.y += (target.y - stage.tilt.y) * 0.08
    }
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      if (askOnTouch) {
        document.removeEventListener('touchend', askOnTouch)
        document.removeEventListener('click', askOnTouch)
      }
      gsap.ticker.remove(tick)
      stage.tilt.x = stage.tilt.y = 0
    }
  }, [enabled])
}

/**
 * Arrastar o dedo na horizontal sobre um ponto do prisma gira o prisma com inércia; ao soltar, volta com mola.
 * Gesto vertical fica com a página (touch-action: pan-y). Toque rápido faz o feixe pulsar.
 */
function attachTouch(node: HTMLElement) {
  let id: number | null = null
  let x0 = 0
  let y0 = 0
  let t0 = 0
  let start = 0
  let lastX = 0
  let lastT = 0
  let vel = 0
  let horizontal: boolean | null = null

  const down = (e: PointerEvent) => {
    id = e.pointerId
    x0 = lastX = e.clientX
    y0 = e.clientY
    t0 = lastT = performance.now()
    start = stage.drag
    vel = 0
    horizontal = null
    gsap.killTweensOf(stage, 'drag')
  }
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const dx = e.clientX - x0
    const dy = e.clientY - y0
    // decide o eixo depois de um pequeno deslocamento
    if (horizontal === null && Math.hypot(dx, dy) > 8) horizontal = Math.abs(dx) > Math.abs(dy)
    if (!horizontal) return
    const now = performance.now()
    vel = (e.clientX - lastX) / Math.max(1, now - lastT)
    lastX = e.clientX
    lastT = now
    stage.drag = Math.max(-0.6, Math.min(0.6, start + dx * 0.006))
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    id = null
    const quick = performance.now() - t0 < 260 && Math.hypot(e.clientX - x0, e.clientY - y0) < 10
    if (quick) {
      gsap.fromTo(stage, { pulse: 1 }, { pulse: 0, duration: 1.2, ease: 'power2.out' })
      return
    }
    if (horizontal) {
      // inércia: segue um pouco na direção do gesto e então volta com mola para o repouso
      const coast = Math.max(-0.6, Math.min(0.6, stage.drag + vel * 0.2))
      gsap
        .timeline()
        .to(stage, { drag: coast, duration: 0.35, ease: 'power2.out' })
        .to(stage, { drag: 0, duration: 1.6, ease: 'elastic.out(1, 0.45)' })
    }
  }
  const cancel = (e: PointerEvent) => {
    // a página assumiu o gesto (rolagem vertical): o prisma volta ao repouso
    if (e.pointerId !== id) return
    id = null
    gsap.to(stage, { drag: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
  }
  node.style.pointerEvents = 'auto'
  node.style.touchAction = 'pan-y'
  node.addEventListener('pointerdown', down)
  node.addEventListener('pointermove', move)
  node.addEventListener('pointerup', up)
  node.addEventListener('pointercancel', cancel)
  return () => {
    node.style.pointerEvents = ''
    node.style.touchAction = ''
    node.removeEventListener('pointerdown', down)
    node.removeEventListener('pointermove', move)
    node.removeEventListener('pointerup', up)
    node.removeEventListener('pointercancel', cancel)
  }
}

/**
 * Celular: um prisma 3D só, vivo na página inteira, numa camada fixa atrás do conteúdo.
 * Ele encaixa em três pontos (topo, abertura das soluções, chamada final) e acompanha cada um enquanto
 * ele passa pela tela. Quando o ponto sobe além do alto da tela, o prisma fica preso ali e se apaga aos
 * poucos com a rolagem, como a cena do desktop. Fora da tela não renderiza nada.
 */
export default function MobilePrism() {
  const layer = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)

  // carrega logo depois da abertura (o texto já pintou): no escuro, cada segundo de espera conta
  useEffect(() => {
    let timer = 0
    const go = () => {
      timer = window.setTimeout(() => {
        const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 500 }) : cb())
        idle(() => setLoad(true))
      }, 200)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => window.clearTimeout(timer)
  }, [])

  // rede de segurança: se o 3D não acender em 10s (aparelho fraco, WebGL travado), a foto do prisma aparece
  useEffect(() => {
    if (ready) return
    const timer = window.setTimeout(() => document.documentElement.classList.remove('m3d'), 10000)
    return () => window.clearTimeout(timer)
  }, [ready])

  // acendeu: o brilho de espera some e, quando o leque termina de abrir, um clarão marca a entrada
  useEffect(() => {
    if (!ready) return
    document.documentElement.classList.add('m3d-live')
    const flash = gsap.delayedCall(1.75, () => {
      if (!prefersReducedMotion()) gsap.fromTo(stage, { pulse: 1 }, { pulse: 0, duration: 1.6, ease: 'power2.out' })
    })
    return () => {
      flash.kill()
      document.documentElement.classList.remove('m3d-live')
    }
  }, [ready])

  // a cada quadro: em qual ponto o prisma está, onde ele fica na tela e quanto aparece
  useEffect(() => {
    let shown = true
    const tick = () => {
      const vh = window.innerHeight
      const pin = vh * PIN
      let current: { key: string; rect: DOMRect } | null = null
      for (const s of SLOTS) {
        const el = document.querySelector(s.selector)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        // vale o último ponto que já entrou na tela
        if (!current || rect.top < vh) current = { key: s.key, rect }
      }
      if (!current) return
      const { key, rect } = current
      const center = rect.top + rect.height / 2
      let y = center
      // chegando por baixo: acende conforme o espaço entra na tela (o feixe é longo e não pode
      // aparecer sobre o texto de cima antes do prisma chegar)
      // saindo por cima: apaga conforme o espaço deixa a tela (e para de renderizar quando sai de vez)
      let v = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height * 0.9)), Math.max(0, rect.bottom / (rect.height * 0.9)))
      if (key === 'hero' && center < pin) {
        // só no topo o prisma fica preso no alto e se apaga com a rolagem (o texto do hero some junto);
        // nas outras paradas ele sobe com a página, para não ficar atrás de texto
        y = pin
        v = 1 - Math.min(1, (pin - center) / (vh * FADE))
      }
      // no topo o prisma é o protagonista: maior que o espaço dele e um pouco mais baixo (o feixe branco
      // precisa de espaço abaixo do menu para cruzar a tela). Em tela baixa (iPhone SE) o espaço encolhe
      // para 33% da altura e o aumento cai junto, senão o prisma invade o título
      const room = Math.min(1, rect.height / (vh * 0.42))
      const heroRoom = room * room
      if (key === 'hero') y += vh * HERO_DROP * heroRoom
      stage.mobile.y = y
      stage.mobile.band = rect.height
      // quanto o prisma aparece agora: os feixes de fundo (MobileBeams) se apagam onde ele está
      stage.mobile.vis = ready ? v : 0
      stage.mobile.zoom = key === 'hero' ? 1 + (HERO_ZOOM - 1) * heroRoom : 1
      // o giro de saída é coisa do topo; nas outras paradas o prisma volta reto
      stage.exitMix = key === 'hero' ? 1 : 0
      // na chamada final o espectro volta mais intenso
      stage.finale = key === 'contato' ? v : 0

      const el = layer.current
      if (el) {
        el.style.opacity = ready ? v.toFixed(3) : '0'
        el.style.setProperty('--py', `${y.toFixed(1)}px`)
        el.style.setProperty('--pb', `${(rect.height * stage.mobile.zoom).toFixed(1)}px`)
      }
      const on = v > 0.002
      if (on !== shown) {
        shown = on
        setVisible(on)
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      stage.exitMix = 1
      stage.finale = 0
    }
  }, [ready])

  // com o 3D no ar: as reservas estáticas somem e os pontos passam a responder ao dedo
  useEffect(() => {
    if (!ready) return
    const faded: HTMLElement[] = []
    const detach: (() => void)[] = []
    const claim = () => {
      for (const s of SLOTS) {
        const slot = document.querySelector<HTMLElement>(s.selector)
        if (!slot || slot.dataset.prismClaimed) continue
        slot.dataset.prismClaimed = '1'
        slot.querySelectorAll<HTMLElement>('img, svg').forEach((n) => {
          n.style.transition = 'opacity 700ms ease'
          n.style.opacity = '0'
          faded.push(n)
        })
        detach.push(attachTouch(slot), () => delete slot.dataset.prismClaimed)
      }
    }
    claim()
    // as seções de baixo montam depois do topo
    const timer = window.setInterval(claim, 1000)
    return () => {
      window.clearInterval(timer)
      faded.forEach((n) => (n.style.opacity = ''))
      detach.forEach((d) => d())
    }
  }, [ready])

  useGyro(ready)

  return (
    <div ref={layer} aria-hidden="true" className="mobile-stage" style={{ opacity: 0 }}>
      {load && (
        <Suspense fallback={null}>
          <PrismCanvas quality="low" post={false} framing="mobile" active={visible} onReady={() => setReady(true)} />
        </Suspense>
      )}
    </div>
  )
}
