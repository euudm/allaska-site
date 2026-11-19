/**
 * Estado compartilhado entre o scroll, a cena 3D e a interface.
 * Mutável de propósito: lido a cada frame sem passar pelo React.
 */
export const stage = {
  /** 0 no topo do hero, 1 quando o espectro está totalmente aberto */
  open: 0,
  /** 0 a 1: quanto a cena recua para dar espaço ao manifesto */
  dim: 0,
  /** 0 a 1: a cena some depois do espectro */
  after: 0,
  /** 0 a 1: aproximação do prisma na seção do espectro */
  zoom: 0,
  /** 0 a 1: o prisma volta no CTA final, na pose do hero e com o espectro completo */
  finale: 0,
  /** 0 a 1: a cena recua de novo para o FAQ e o rodapé */
  outro: 0,
  /** raio em destaque: -1 nenhum (todos iguais), 0 a 5 um raio, 6 todos acesos */
  active: -1,
  /** animação de entrada, cada etapa de 0 a 1: prisma surge, feixe viaja, brilho acende, leque abre */
  introPrism: 0,
  introBeam: 0,
  introFlare: 0,
  introFan: 0,
  /** 0 a 1: saindo do hero pelo scroll (o prisma gira e o espectro intensifica antes de esmaecer) */
  heroExit: 0,
  /** 0 a 1: quanto o giro de saída do hero vale agora (no celular só vale no topo) */
  exitMix: 1,
  /** 0 a 1: celular, seção do espectro presa: o raio ativo se destaca sem a aproximação do desktop */
  focusMix: 0,
  /** celular: centro do prisma na tela e altura do espaço onde ele encaixa, em px CSS */
  mobile: { y: 0, band: 0, zoom: 1, vis: 0 },
  /** inclinação vinda do giroscópio do celular, em radianos (já limitada e suavizada) */
  tilt: { x: 0, y: 0 },
  /** giro vindo do arraste do dedo, em radianos */
  drag: 0,
  /** 0 a 1: pulso forte do feixe após um toque rápido no prisma */
  pulse: 0,
  /** animação contínua (flutuar, pulsar, shimmer): desligada com movimento reduzido */
  idle: 1,
  /** ponteiro normalizado, -1 a 1 */
  pointer: { x: 0, y: 0 },
  /** ponteiro suavizado (inércia) */
  pointerSmooth: { x: 0, y: 0 },
}

/** Aproximação efetiva: no CTA final a cena desfaz o zoom do espectro. */
export const zoomNow = () => stage.zoom * (1 - stage.finale)

/** As 6 cores do espectro, uma por solução, na ordem de saída do prisma. */
export const SPECTRUM = ['#ff4d3d', '#ff8a2a', '#ffc93c', '#8fe06a', '#3cc4ff', '#9a6bff'] as const
