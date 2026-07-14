// Registry único da equipe editorial — fonte de verdade pra:
//   1. página /sobre/equipe-editorial (bios visíveis + JSON-LD de membros)
//   2. bio visível no rodapé de cada post (BlogPostClient)
//   3. JSON-LD `author` de cada post (blog/[slug]/page.tsx)
//
// Antes deste registry, o JSON-LD de TODOS os posts apontava `author.@id` pra
// `#mariana-fonseca` independentemente do byline real (name divergia do @id) —
// entidade inconsistente que quebra o sinal de E-E-A-T. Aqui cada persona tem
// um @id/anchor próprio e o post resolve pela string `author`.
//
// Bios honestas: descrevem o papel editorial e a área de foco de cada redator,
// sem inventar credenciais acadêmicas ou experiência em 1ª pessoa (o conteúdo
// não deve alegar vivência pessoal não verificável — ver CLAUDE.md).

const SITE_URL = 'https://www.bolsaclick.com.br'

export interface EditorialPersona {
  /** Anchor estável na página de equipe (usado no @id do JSON-LD). */
  slug: string
  name: string
  /** Iniciais pro avatar. */
  initials: string
  jobTitle: string
  /** Bio visível na página de equipe e no rodapé do post. */
  bio: string
  /** Áreas de conhecimento pro `knowsAbout` do JSON-LD Person. */
  knowsAbout: string[]
}

// Ordem = ordem de exibição na página de equipe.
export const EDITORIAL_TEAM: EditorialPersona[] = [
  {
    slug: 'mariana-fonseca',
    name: 'Mariana Fonseca',
    initials: 'MF',
    jobTitle: 'Editora de Conteúdo Educacional',
    bio: 'Jornalista especializada em acesso à educação superior, financiamento estudantil e mercado de trabalho. Cobre ProUni, FIES, ENEM e bolsas em faculdades privadas há mais de oito anos. No Bolsa Click, é responsável pelos guias de carreira, análises de mensalidade e artigos sobre programas federais.',
    knowsAbout: [
      'Bolsas de estudo',
      'ProUni',
      'FIES',
      'ENEM',
      'Educação superior EAD',
      'Financiamento estudantil',
    ],
  },
  {
    slug: 'luis-fernando-costa',
    name: 'Luis Fernando Costa',
    initials: 'LC',
    jobTitle: 'Redator de Carreira e Mercado',
    bio: 'Redator focado em carreira, profissões e mercado de trabalho. No Bolsa Click, escreve sobre salários e demanda por profissão a partir de dados do CAGED e conselhos de classe, ajudando o leitor a escolher curso com base em perspectiva real de atuação.',
    knowsAbout: [
      'Carreiras e profissões',
      'Mercado de trabalho brasileiro',
      'Salários por profissão',
      'Escolha de curso',
    ],
  },
  {
    slug: 'rafael-mendes',
    name: 'Rafael Mendes',
    initials: 'RM',
    jobTitle: 'Redator de Educação a Distância',
    bio: 'Redator dedicado a ensino a distância e modalidades de graduação. No Bolsa Click, cobre reconhecimento de cursos EAD pelo MEC, diferenças entre EAD, semipresencial e presencial, e como funcionam polos e bolsas na modalidade a distância.',
    knowsAbout: [
      'Educação a distância (EAD)',
      'Reconhecimento MEC',
      'Modalidades de graduação',
      'Polos de apoio presencial',
    ],
  },
  {
    slug: 'camila-rocha',
    name: 'Camila Rocha',
    initials: 'CR',
    jobTitle: 'Redatora de Vestibular e ENEM',
    bio: 'Redatora focada em preparação para o vestibular e o ENEM. No Bolsa Click, escreve guias de cronograma de estudos, redação, provas por área de conhecimento e o passo a passo de SISU, ProUni e segunda chamada.',
    knowsAbout: [
      'ENEM',
      'Vestibular',
      'SISU',
      'Técnicas de estudo',
      'Redação',
    ],
  },
  {
    slug: 'thiago-oliveira',
    name: 'Thiago Oliveira',
    initials: 'TO',
    jobTitle: 'Redator de Graduação e Áreas',
    bio: 'Redator de panorama de cursos e áreas de atuação. No Bolsa Click, cobre grade curricular, campos de trabalho por curso e as diferenças entre bacharelado, licenciatura e tecnólogo, com foco em decisão prática.',
    knowsAbout: [
      'Cursos de graduação',
      'Bacharelado, licenciatura e tecnólogo',
      'Áreas de atuação profissional',
      'Grade curricular',
    ],
  },
]

// Persona genérica pra bylines não mapeadas (ex.: "Equipe Bolsa Click"). Aponta
// pra entidade Organization da equipe editorial, não pra uma Person inventada.
export const EDITORIAL_TEAM_ORG = {
  slug: 'editorial-team',
  name: 'Equipe Editorial Bolsa Click',
  jobTitle: 'Equipe Editorial',
  bio: 'Time editorial do Bolsa Click, especializado em educação superior, bolsas de estudo e programas federais de acesso ao ensino no Brasil.',
}

const BY_NAME = new Map(EDITORIAL_TEAM.map((p) => [p.name.toLowerCase().trim(), p]))

/**
 * Resolve a string `author` do post pra uma persona do registry.
 * Retorna `null` quando o byline não bate com nenhuma persona nomeada (o caller
 * deve cair no fallback de Organization — EDITORIAL_TEAM_ORG).
 */
export function getPersona(authorName: string | null | undefined): EditorialPersona | null {
  if (!authorName) return null
  return BY_NAME.get(authorName.toLowerCase().trim()) ?? null
}

/** @id canônico (âncora na página de equipe) pra uma persona ou pro time. */
export function personaAtId(persona: EditorialPersona | null): string {
  const anchor = persona ? persona.slug : EDITORIAL_TEAM_ORG.slug
  return `${SITE_URL}/sobre/equipe-editorial#${anchor}`
}
