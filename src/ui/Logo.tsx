/** Marca da Allaska: o pico em dois cortes, redesenhado em vetor a partir do logo.png. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 158 152" className={className} aria-hidden="true" fill="currentColor">
      <polygon points="78,3 155,150 100,132 53,62" />
      <polygon points="42,80 75,142 2,148" />
    </svg>
  )
}
