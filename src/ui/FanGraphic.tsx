import { SPECTRUM } from '../lib/stage'

/**
 * Versão 2D do prisma com o leque, para o modo leve (celular e aparelho fraco).
 * active: -1 todos médios, 0 a 5 destaca um raio, 6 todos acesos.
 */
export default function FanGraphic({ active, className = '' }: { active: number; className?: string }) {
  const exit = { x: 104, y: 92 }
  return (
    <svg viewBox="0 0 400 230" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fan-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f0eb" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#9aa4c8" stopOpacity="0.08" />
          <stop offset="1" stopColor="#f2f0eb" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="fan-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#f2f0eb" stopOpacity="0.25" />
          <stop offset="1" stopColor="#8fb4ff" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fan-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
        {SPECTRUM.map((c, i) => (
          <linearGradient key={c} id={`fan-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.25" stopColor={c} />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      <line x1="0" y1="0" x2="66" y2="70" stroke="url(#fan-beam)" strokeWidth="1.6" />

      {SPECTRUM.map((c, i) => {
        const angle = 0.08 + i * 0.1
        const len = 320
        const x2 = exit.x + Math.cos(angle) * len
        const y2 = exit.y + Math.sin(angle) * len
        const on = active === i
        const all = active >= SPECTRUM.length
        const opacity = active < 0 ? 0.55 : all ? 0.95 : on ? 1 : 0.14
        return (
          <line
            key={c}
            x1={exit.x}
            y1={exit.y}
            x2={x2}
            y2={y2}
            stroke={`url(#fan-${i})`}
            strokeWidth={on ? 3.2 : 2}
            strokeLinecap="round"
            style={{
              opacity,
              filter: on || all ? `drop-shadow(0 0 6px ${c})` : undefined,
              transition: 'opacity .6s, stroke-width .6s',
            }}
          />
        )
      })}

      {/* o "A" do logo em vidro, simplificado */}
      <g transform="translate(40 40) scale(0.62)" stroke="url(#fan-edge)" strokeWidth="2" fill="url(#fan-glass)" strokeLinejoin="round">
        <polygon points="78,3 155,150 100,132 53,62" />
        <polygon points="51,76 84,138 11,144" />
      </g>
      <circle cx="68" cy="72" r="3" fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #fff)' }} />
    </svg>
  )
}
