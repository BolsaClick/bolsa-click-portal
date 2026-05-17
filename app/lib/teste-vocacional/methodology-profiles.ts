// Metodologia: RIASEC (Holland, 1959) + Inteligências Múltiplas (Gardner, 1983)
// Cada curso do TOP_CURSOS é mapeado pra um Holland Code (primary/secondary/tertiary)
// e top 2-3 inteligências de Gardner. Esse mapeamento é a base do matching
// determinístico entre perfil do usuário e cursos.

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type GardnerIntelligence =
  | 'linguistica'
  | 'logico-matematica'
  | 'espacial'
  | 'musical'
  | 'corporal-cinestesica'
  | 'interpessoal'
  | 'intrapessoal'
  | 'naturalista'

export interface CourseProfile {
  riasec: { primary: RiasecType; secondary: RiasecType; tertiary: RiasecType }
  gardner: GardnerIntelligence[]
}

export const COURSE_PROFILES: Record<string, CourseProfile> = {
  administracao: { riasec: { primary: 'E', secondary: 'C', tertiary: 'S' }, gardner: ['interpessoal', 'logico-matematica'] },
  direito: { riasec: { primary: 'E', secondary: 'S', tertiary: 'A' }, gardner: ['linguistica', 'logico-matematica', 'interpessoal'] },
  enfermagem: { riasec: { primary: 'S', secondary: 'I', tertiary: 'R' }, gardner: ['interpessoal', 'corporal-cinestesica', 'naturalista'] },
  psicologia: { riasec: { primary: 'S', secondary: 'I', tertiary: 'A' }, gardner: ['interpessoal', 'intrapessoal', 'linguistica'] },
  'educacao-fisica': { riasec: { primary: 'S', secondary: 'R', tertiary: 'E' }, gardner: ['corporal-cinestesica', 'interpessoal', 'naturalista'] },
  pedagogia: { riasec: { primary: 'S', secondary: 'A', tertiary: 'C' }, gardner: ['interpessoal', 'linguistica', 'intrapessoal'] },
  'analise-e-desenvolvimento-de-sistemas': { riasec: { primary: 'I', secondary: 'C', tertiary: 'R' }, gardner: ['logico-matematica', 'espacial', 'intrapessoal'] },
  'gestao-de-recursos-humanos': { riasec: { primary: 'S', secondary: 'E', tertiary: 'C' }, gardner: ['interpessoal', 'intrapessoal', 'linguistica'] },
  marketing: { riasec: { primary: 'E', secondary: 'A', tertiary: 'S' }, gardner: ['linguistica', 'interpessoal', 'espacial'] },
  'ciencias-contabeis': { riasec: { primary: 'C', secondary: 'I', tertiary: 'E' }, gardner: ['logico-matematica', 'intrapessoal'] },
  'arquitetura-e-urbanismo': { riasec: { primary: 'A', secondary: 'I', tertiary: 'R' }, gardner: ['espacial', 'logico-matematica', 'naturalista'] },
  nutricao: { riasec: { primary: 'I', secondary: 'S', tertiary: 'C' }, gardner: ['logico-matematica', 'naturalista', 'interpessoal'] },
  fisioterapia: { riasec: { primary: 'S', secondary: 'I', tertiary: 'R' }, gardner: ['corporal-cinestesica', 'interpessoal', 'naturalista'] },
  'engenharia-civil': { riasec: { primary: 'R', secondary: 'I', tertiary: 'C' }, gardner: ['logico-matematica', 'espacial', 'corporal-cinestesica'] },
  'engenharia-de-producao': { riasec: { primary: 'I', secondary: 'E', tertiary: 'C' }, gardner: ['logico-matematica', 'interpessoal', 'espacial'] },
  biomedicina: { riasec: { primary: 'I', secondary: 'R', tertiary: 'S' }, gardner: ['logico-matematica', 'naturalista', 'intrapessoal'] },
  odontologia: { riasec: { primary: 'I', secondary: 'R', tertiary: 'S' }, gardner: ['corporal-cinestesica', 'logico-matematica', 'interpessoal'] },
  'gestao-comercial': { riasec: { primary: 'E', secondary: 'S', tertiary: 'C' }, gardner: ['interpessoal', 'linguistica'] },
  farmacia: { riasec: { primary: 'I', secondary: 'C', tertiary: 'R' }, gardner: ['logico-matematica', 'naturalista'] },
  medicina: { riasec: { primary: 'I', secondary: 'S', tertiary: 'R' }, gardner: ['logico-matematica', 'naturalista', 'interpessoal'] },
}

export const RIASEC_DESCRIPTIONS: Record<RiasecType, { name: string; short: string; description: string }> = {
  R: {
    name: 'Realista',
    short: 'Mão na massa',
    description:
      'Você se sente mais à vontade resolvendo problemas concretos, trabalhando com ferramentas, materiais ou seu próprio corpo. Prefere ação a teoria, prática a abstração.',
  },
  I: {
    name: 'Investigativo',
    short: 'Curioso e analítico',
    description:
      'Você gosta de entender como as coisas funcionam, analisar dados, investigar causas. Aprende por análise e pesquisa, valoriza explicações lógicas e independência intelectual.',
  },
  A: {
    name: 'Artístico',
    short: 'Criativo e expressivo',
    description:
      'Você se conecta com criação, expressão, estética e originalidade. Tem facilidade pra pensar fora da caixa e valoriza liberdade pra inventar e improvisar.',
  },
  S: {
    name: 'Social',
    short: 'Foco em pessoas',
    description:
      'Você se realiza em ajudar, ensinar, cuidar ou inspirar outras pessoas. Tem boa leitura emocional, gosta de cooperação e busca trabalho com impacto direto na vida dos outros.',
  },
  E: {
    name: 'Empreendedor',
    short: 'Liderança e persuasão',
    description:
      'Você gosta de tomar iniciativa, influenciar pessoas, vender ideias e correr riscos calculados. Energia pra liderar projetos e transformar oportunidades em resultado.',
  },
  C: {
    name: 'Convencional',
    short: 'Organização e processos',
    description:
      'Você se dá bem com estrutura, regras claras, dados organizados e processos previsíveis. Tem precisão, atenção a detalhes e gosto por sistemas bem montados.',
  },
}

export const GARDNER_DESCRIPTIONS: Record<GardnerIntelligence, { name: string; short: string; description: string }> = {
  linguistica: {
    name: 'Linguística',
    short: 'Palavras',
    description: 'Facilidade com palavras, leitura, escrita, oratória, narrativa e argumentação verbal.',
  },
  'logico-matematica': {
    name: 'Lógico-matemática',
    short: 'Lógica e números',
    description: 'Raciocínio lógico, pensamento abstrato, padrões, resolução de problemas matemáticos e análise sistemática.',
  },
  espacial: {
    name: 'Espacial',
    short: 'Visualização',
    description: 'Capacidade de visualizar objetos, espaços e relações tridimensionais. Mapas, design, arquitetura, artes visuais.',
  },
  musical: {
    name: 'Musical',
    short: 'Som e ritmo',
    description: 'Sensibilidade a sons, ritmos, melodias, timbres. Composição, performance, audição crítica.',
  },
  'corporal-cinestesica': {
    name: 'Corporal-cinestésica',
    short: 'Corpo e movimento',
    description: 'Controle fino do corpo, coordenação motora, expressão física. Esportes, dança, manipulação manual, terapias corporais.',
  },
  interpessoal: {
    name: 'Interpessoal',
    short: 'Relações',
    description: 'Leitura de pessoas, empatia, comunicação, cooperação. Trabalho em equipe, liderança, mediação, vendas.',
  },
  intrapessoal: {
    name: 'Intrapessoal',
    short: 'Autoconhecimento',
    description: 'Consciência das próprias emoções, valores e motivações. Autorregulação, reflexão, projetos autônomos.',
  },
  naturalista: {
    name: 'Naturalista',
    short: 'Natureza e seres vivos',
    description: 'Sensibilidade ao mundo natural, padrões biológicos, ecossistemas. Trabalho com plantas, animais, ambiente, sustentabilidade.',
  },
}
