import { SPECTRUM } from '../lib/stage'

export type Solution = {
  n: string
  name: string
  result: string
  video: string
  color: string
  /** página de produto antiga, mantida no ar */
  href?: string
}

const v = (slug: string) => `/midia/solucoes/${slug}`

/** Textos de resultado sem números inventados: descrevem o que o sistema faz, não prometem métrica. */
export const SOLUTIONS: Solution[] = [
  {
    n: '01',
    name: 'Site de alta performance',
    result: 'Seu negócio aparece no Google quando alguém da sua cidade procura o que você vende.',
    video: v('criacao-de-sites'),
    color: SPECTRUM[0],
    href: '/produto/criacao-de-sites/',
  },
  {
    n: '02',
    name: 'Prospecção automática',
    result: 'O sistema encontra, qualifica e aborda novos clientes todo dia, enquanto você atende.',
    video: v('prospeccao-leads'),
    color: SPECTRUM[1],
  },
  {
    n: '03',
    name: 'Conteúdo automático para redes',
    result: 'Carrosséis e stories com a sua identidade, prontos para publicar, sem depender de designer.',
    video: v('conteudo-redes-sociais'),
    color: SPECTRUM[2],
  },
  {
    n: '04',
    name: 'Remarketing automático',
    result: 'Quem visitou e não fechou recebe o lembrete certo, na hora certa, e volta.',
    video: v('remarketing-automatico'),
    color: SPECTRUM[3],
    href: '/produto/remarketing-automatico/',
  },
  {
    n: '05',
    name: 'Chatbot com IA + Google',
    result: 'Responde na hora, a qualquer hora, e pede a avaliação no Google no momento certo.',
    video: v('chatbot-avaliacoes-google'),
    color: SPECTRUM[4],
  },
  {
    n: '06',
    name: 'Proposta comercial + follow-up',
    result: 'Proposta em PDF em minutos e um aviso, com a mensagem pronta, no dia certo de cobrar.',
    video: v('proposta-follow-up'),
    color: SPECTRUM[5],
  },
]
