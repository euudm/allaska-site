const WHATSAPP = 'https://wa.me/5511940643165'

export const whatsapp = (text = 'Oi, vim pelo site da Allaska e quero ver minha demo grátis!') =>
  `${WHATSAPP}?text=${encodeURIComponent(text)}`

export const INSTAGRAM = {
  diego: 'https://www.instagram.com/euudm/',
  lucka: 'https://www.instagram.com/luckamontino/',
}
