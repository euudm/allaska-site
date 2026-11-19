/**
 * Só clientes reais com site entregue e no ar. As imagens são capturas da página inteira
 * (public/midia/projetos/*.webp); para atualizar, capture de novo e substitua o arquivo.
 */
export type Project = {
  slug: string
  name: string
  niche: string
  description: string
  url: string
  domain: string
}

export const PROJECTS: Project[] = [
  {
    slug: 'physical-tiger',
    name: 'Physical Tiger',
    niche: 'Artes marciais · Osasco, SP',
    description: 'Programas, professores e aula experimental a um toque do WhatsApp.',
    url: 'https://physicaltiger.com.br/',
    domain: 'physicaltiger.com.br',
  },
  {
    slug: 'diesel-frunquins',
    name: 'Oficina Diesel Frunquins',
    niche: 'Socorro mecânico 24h · caminhões e vans',
    description: 'Equipes móveis que vão até o caminhão parado na estrada, com central no WhatsApp 24 horas.',
    url: 'https://melodic-narwhal-47d6bb.netlify.app/',
    domain: 'melodic-narwhal-47d6bb.netlify.app',
  },
  {
    slug: 'prorod',
    name: 'Prorod',
    niche: 'Injeção eletrônica e diagnóstico · Taboão da Serra, SP',
    description: 'Diagnóstico por scanner, injeção eletrônica e revisão para importados e nacionais, com agendamento pelo WhatsApp.',
    url: 'https://phenomenal-banoffee-5b32dd.netlify.app/',
    domain: 'phenomenal-banoffee-5b32dd.netlify.app',
  },
]
