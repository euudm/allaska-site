import { useEffect, useState } from 'react'
import { whatsapp } from '../lib/links'

/**
 * Botão de WhatsApp fixo embaixo, só no celular (abaixo de 768px). Aparece depois do hero
 * e some na seção final de contato, onde o botão grande já está na tela.
 */
export default function StickyCta() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('inicio')
    let pastHero = false
    let atContact = false
    const update = () => setShow(pastHero && !atContact)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target.id === 'inicio') pastHero = !e.isIntersecting && e.boundingClientRect.top < 0
        else atContact = e.isIntersecting
      }
      update()
    })
    if (hero) io.observe(hero)
    // as seções do fim montam um instante depois do hero
    const watchEnd = () => {
      const end = [document.getElementById('contato'), document.querySelector('footer')]
      if (!end[0]) return false
      end.forEach((el) => el && io.observe(el))
      return true
    }
    let timer = 0
    if (!watchEnd()) timer = window.setInterval(() => watchEnd() && window.clearInterval(timer), 300)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div className={`sticky-cta md:hidden ${show ? 'is-shown' : ''}`} aria-hidden={!show} inert={!show}>
      <a href={whatsapp()} target="_blank" rel="noopener" className="btn btn-solid w-full justify-center shadow-[0_12px_40px_rgba(0,0,0,0.55)]" data-umami-event="whatsapp-fixo-mobile">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3l-4.5 1.5Z" strokeLinejoin="round" />
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2L9 9.5Z" strokeLinejoin="round" />
        </svg>
        Ver minha demo grátis
      </a>
    </div>
  )
}
