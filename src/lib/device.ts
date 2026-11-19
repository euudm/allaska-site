import { useEffect, useState } from 'react'

export type SceneMode = 'full' | 'lite'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 'full' = cena WebGL com o prisma.
 * 'lite' = fundo em CSS + ilustração estática, para celular, aparelho fraco ou movimento reduzido.
 */
/**
 * GPU integrada (Intel, Radeon "Graphics" de notebook, Apple sem ser Pro...) compila shaders devagar:
 * usa o prisma sem pós-processamento para não travar a página por segundos na carga.
 */
export function detectGpuTier(): 'high' | 'low' {
  const params = new URLSearchParams(window.location.search)
  if (params.has('gpu-low')) return 'low'
  if (params.has('gpu-high')) return 'high'
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return 'low'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    if (/Intel|Iris|UHD|Radeon\(TM\) Graphics|Radeon Graphics|Vega \d+ Graphics|Microsoft|SwiftShader|llvmpipe|Mali|Adreno/i.test(name)) return 'low'
    return 'high'
  } catch {
    return 'low'
  }
}

export function detectSceneMode(): SceneMode {
  if (typeof window === 'undefined') return 'lite'
  const params = new URLSearchParams(window.location.search)
  if (params.has('lite')) return 'lite'
  if (params.has('full')) return 'full'
  if (prefersReducedMotion()) return 'lite'

  const finePointer = window.matchMedia('(pointer: fine)').matches
  const wide = window.innerWidth >= 900
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  if (!finePointer || !wide || cores < 4 || memory < 4) return 'lite'

  try {
    const canvas = document.createElement('canvas')
    if (!canvas.getContext('webgl2')) return 'lite'
  } catch {
    return 'lite'
  }
  return 'full'
}

/** Largura abaixo da qual o 3D não cabe: vale a versão de celular (a mesma regra de detectSceneMode). */
export const NARROW_QUERY = '(max-width: 899px)'

/** true enquanto a janela estiver estreita; reage quando a pessoa redimensiona ou gira o tablet. */
export function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(NARROW_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

/** Celular que recebe o prisma 3D vivo (o resto fica com as imagens estáticas). */
export function canMobile3D(mode: SceneMode) {
  return mode === 'lite' && window.matchMedia('(max-width: 639px)').matches && !prefersReducedMotion() && hasWebGL()
}

/** true enquanto a media query bater; reage a redimensionar a janela ou girar o aparelho. */
export function useMatch(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** WebGL disponível (sem ele o celular fica só com a imagem do prisma). */
export function hasWebGL() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'))
  } catch {
    return false
  }
}
