import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const institutions = [
  {
    slug: 'anhanguera',
    name: 'Anhanguera',
    shortName: 'ANHANGUERA',
    fullName: 'Universidade Anhanguera',
    description: 'A Anhanguera é uma das maiores instituições de ensino superior do Brasil, pertencente ao grupo Cogna Educação. Com mais de 70 polos de ensino presencial e EAD espalhados pelo país, oferece cursos de graduação, pós-graduação e extensão com mensalidades acessíveis e bolsas de estudo de até 80%.',
    longDescription: `A Anhanguera foi fundada em 1994 em Leme, interior de São Paulo, e desde então se consolidou como uma das maiores e mais reconhecidas instituições de ensino superior do Brasil. Atualmente faz parte do grupo Cogna Educação (antiga Kroton), o maior grupo educacional privado do país.

Com mais de 70 unidades presenciais e centenas de polos de educação a distância (EAD), a Anhanguera está presente em todas as regiões do Brasil, oferecendo acesso ao ensino superior para milhões de estudantes. A instituição conta com mais de 500 mil alunos matriculados em seus diversos programas acadêmicos.

A Anhanguera oferece cursos de graduação (bacharelado, licenciatura e tecnólogo), pós-graduação (especialização e MBA), além de cursos livres e de extensão. Entre os cursos mais procurados estão Administração, Direito, Enfermagem, Pedagogia e Análise e Desenvolvimento de Sistemas.

A instituição é reconhecida pelo MEC com nota institucional 3, o que demonstra sua qualidade de ensino. Além disso, a Anhanguera investe em metodologias de ensino inovadoras, como aulas interativas, laboratórios virtuais e parcerias com empresas para estágios e empregabilidade.

Entre os principais diferenciais da Anhanguera estão: mensalidades acessíveis, bolsas de estudo de até 80% de desconto, ampla rede de polos presenciais e EAD, canal de empregabilidade exclusivo para alunos, e diploma reconhecido pelo MEC em todo o território nacional.`,
    founded: 1994,
    type: 'PRIVADA' as const,
    campusCount: 70,
    studentCount: '500.000+',
    coursesOffered: 450,
    headquartersCity: 'Valinhos',
    headquartersState: 'SP',
    mecRating: 3,
    emecLink: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/NQ==',
    modalities: ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Pertence ao grupo Cogna, maior grupo educacional privado do Brasil',
      'Mais de 70 polos presenciais em todo o país',
      'Bolsas de estudo de até 80% de desconto',
      'Canal de empregabilidade exclusivo para alunos',
      'Metodologias de ensino inovadoras com laboratórios virtuais',
      'Diploma reconhecido pelo MEC em todo o Brasil',
    ],
    logoUrl: '/assets/logo-anhanguera-bolsa-click.svg',
    imageUrl: '',
    imageAlt: 'Logo da Universidade Anhanguera',
    keywords: [
      'anhanguera', 'faculdade anhanguera', 'universidade anhanguera',
      'anhanguera ead', 'anhanguera cursos', 'anhanguera bolsa',
      'anhanguera graduação', 'anhanguera pós-graduação',
      'anhanguera mensalidade', 'anhanguera desconto',
    ],
    metaTitle: 'Faculdade Anhanguera - Bolsas de Estudo com até 80% de Desconto | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na faculdade Anhanguera com até 80% de desconto. Cursos de graduação, pós-graduação e EAD. Mais de 70 polos em todo o Brasil. Inscreva-se grátis!',
    isActive: true,
    order: 1,
  },
  {
    slug: 'unopar',
    name: 'Unopar',
    shortName: 'UNOPAR',
    fullName: 'Universidade Norte do Paraná - Unopar',
    description: 'A Unopar é referência nacional em educação a distância (EAD), com mais de 750 polos de apoio presencial em todo o Brasil. Pertencente ao grupo Cogna Educação, oferece cursos de graduação e pós-graduação com metodologia inovadora e mensalidades acessíveis.',
    longDescription: `A Universidade Norte do Paraná (Unopar) foi fundada em 1972 na cidade de Londrina, Paraná, e é uma das instituições pioneiras em educação a distância (EAD) no Brasil. Atualmente integra o grupo Cogna Educação, o maior conglomerado educacional privado da América Latina.

Com mais de 750 polos de apoio presencial distribuídos em todos os estados brasileiros, a Unopar é a universidade com maior capilaridade em EAD do país, atendendo mais de 350 mil alunos. Sua rede de polos permite que estudantes de cidades pequenas e grandes centros tenham acesso a ensino superior de qualidade.

A Unopar oferece mais de 300 cursos de graduação nas modalidades presencial, semipresencial e EAD, além de programas de pós-graduação, cursos técnicos e de extensão. Os cursos mais procurados incluem Pedagogia, Administração, Serviço Social, Ciências Contábeis e Gestão de Recursos Humanos.

Reconhecida pelo MEC com nota institucional 3, a Unopar se destaca por sua metodologia de ensino que combina aulas ao vivo via satélite, material didático digital interativo e encontros presenciais nos polos de apoio. A instituição também oferece programas de estágio e empregabilidade para seus alunos.

Os principais diferenciais da Unopar são: liderança em EAD no Brasil, 750+ polos presenciais para suporte ao aluno, mensalidades acessíveis, tutoria personalizada, material didático digital incluso, e flexibilidade de horários para quem trabalha.`,
    founded: 1972,
    type: 'PRIVADA' as const,
    campusCount: 750,
    studentCount: '350.000+',
    coursesOffered: 300,
    headquartersCity: 'Londrina',
    headquartersState: 'PR',
    mecRating: 3,
    emecLink: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/MTM1',
    modalities: ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Maior rede de EAD do Brasil com 750+ polos presenciais',
      'Pioneira em educação a distância no país',
      'Mensalidades acessíveis com bolsas de até 80%',
      'Aulas ao vivo via satélite com interação em tempo real',
      'Tutoria personalizada e material didático digital incluso',
      'Flexibilidade de horários ideal para quem trabalha',
    ],
    logoUrl: '/assets/logo-unopar.svg',
    imageUrl: '',
    imageAlt: 'Logo da Universidade Unopar',
    keywords: [
      'unopar', 'faculdade unopar', 'universidade unopar',
      'unopar ead', 'unopar cursos', 'unopar bolsa',
      'unopar graduação', 'unopar pós-graduação',
      'unopar mensalidade', 'unopar londrina',
    ],
    metaTitle: 'Faculdade Unopar - Bolsas de Estudo EAD e Presencial com Desconto | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na Faculdade Unopar com descontos especiais. Maior rede de EAD do Brasil com 750+ polos. Graduação e pós-graduação. Inscreva-se grátis!',
    isActive: true,
    order: 2,
  },
  {
    slug: 'pitagoras',
    name: 'Pitágoras',
    shortName: 'PITÁGORAS',
    fullName: 'Faculdade Pitágoras',
    description: 'A Pitágoras é uma tradicional instituição mineira de ensino superior, com origem em 1966 e forte presença em Minas Gerais e no Nordeste. Integra o grupo Cogna Educação e oferece graduação presencial, semipresencial e EAD em todo o Brasil, com bolsas de estudo e mensalidades acessíveis.',
    longDescription: `A Pitágoras começou em 1966 em Belo Horizonte, originalmente como rede de colégios e cursinhos, e evoluiu nas décadas seguintes para se tornar uma das mais reconhecidas marcas de educação superior do Brasil. Hoje a Faculdade Pitágoras integra o grupo Cogna Educação (antiga Kroton), o maior conglomerado educacional privado da América Latina.

A instituição tem forte presença em Minas Gerais — onde nasceu — e ampla atuação no Nordeste, com unidades em estados como Bahia, Maranhão, Pernambuco, Piauí e Ceará. Além das unidades próprias, a Pitágoras opera uma extensa rede de polos de educação a distância (EAD) que permite o acesso ao ensino superior em centenas de municípios brasileiros.

O portfólio acadêmico da Pitágoras cobre as principais áreas do conhecimento, com destaque para Administração, Direito, Engenharias, Pedagogia, Análise e Desenvolvimento de Sistemas, e cursos da área de Saúde como Enfermagem, Fisioterapia e Educação Física. Há também programas de pós-graduação lato sensu (especializações e MBA) em diversas trilhas profissionais.

Reconhecida pelo MEC, a Pitágoras adota uma metodologia que combina aulas presenciais, atividades online e laboratórios práticos, com material didático digital incluso e tutoria de apoio nos polos EAD. A instituição também investe em programas de estágio e empregabilidade através de parcerias com empresas em todo o país.

Entre os diferenciais da Faculdade Pitágoras estão: tradição de mais de 50 anos em educação, ampla rede de unidades em Minas Gerais e no Nordeste, polos EAD em centenas de cidades, mensalidades acessíveis com bolsas de estudo de até 80% de desconto, e diploma reconhecido pelo MEC em todo o território nacional.`,
    founded: 1966,
    type: 'PRIVADA' as const,
    campusCount: null,
    studentCount: null,
    coursesOffered: null,
    headquartersCity: 'Belo Horizonte',
    headquartersState: 'MG',
    mecRating: null,
    emecLink: 'https://emec.mec.gov.br/',
    modalities: ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Mais de 50 anos de tradição em educação, com origem em Belo Horizonte',
      'Pertence ao grupo Cogna, maior grupo educacional privado do Brasil',
      'Forte presença em Minas Gerais e no Nordeste',
      'Polos EAD em centenas de cidades brasileiras',
      'Bolsas de estudo de até 80% de desconto',
      'Diploma reconhecido pelo MEC em todo o Brasil',
    ],
    logoUrl: '/assets/logo-pitagoras.svg',
    imageUrl: '',
    imageAlt: 'Logo da Faculdade Pitágoras',
    keywords: [
      'pitagoras', 'faculdade pitagoras', 'pitagoras belo horizonte',
      'pitagoras ead', 'pitagoras cursos', 'pitagoras bolsa',
      'pitagoras graduação', 'pitagoras pós-graduação',
      'pitagoras mensalidade', 'pitagoras minas gerais',
    ],
    metaTitle: 'Faculdade Pitágoras - Bolsas de Estudo com até 80% de Desconto | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na Faculdade Pitágoras com até 80% de desconto. Tradição de mais de 50 anos, polos em MG e no Nordeste. EAD e presencial. Inscreva-se grátis!',
    isActive: true,
    order: 3,
  },
  {
    slug: 'ampli',
    name: 'Ampli',
    shortName: 'AMPLI',
    fullName: 'Ampli',
    description: 'A Ampli é a faculdade 100% digital do grupo Cogna Educação, criada para tornar o ensino superior mais acessível através de cursos totalmente online com mensalidades baixas e flexibilidade total. Oferece graduação reconhecida pelo MEC sem necessidade de comparecer a polos físicos.',
    longDescription: `A Ampli é uma das mais recentes e inovadoras instituições de ensino superior do Brasil, criada pelo grupo Cogna Educação (antiga Kroton) com uma proposta clara: oferecer graduação 100% online, com mensalidades acessíveis e total flexibilidade para o aluno estudar de onde quiser.

Diferente do EAD tradicional, na Ampli não é necessário comparecer a polos físicos. Todo o curso — aulas, materiais, avaliações e atividades — acontece no ambiente virtual da plataforma, permitindo que o estudante organize seu próprio tempo de estudo. Essa modalidade é ideal para quem precisa conciliar a faculdade com trabalho, família ou outras responsabilidades.

O catálogo da Ampli foca em cursos de graduação com alta demanda no mercado de trabalho, como Administração, Análise e Desenvolvimento de Sistemas, Pedagogia, Recursos Humanos, Marketing, Gestão Financeira, Gestão Comercial, Logística e cursos tecnólogos em diversas áreas. Os cursos são reconhecidos pelo MEC, com a mesma validade do diploma de qualquer faculdade presencial.

A metodologia da Ampli é baseada em aulas em vídeo gravadas e ao vivo, materiais didáticos digitais interativos, fóruns de discussão e tutoria online. A plataforma também conta com biblioteca virtual ampla e ferramentas de empregabilidade, conectando alunos a vagas em empresas parceiras do grupo Cogna.

Entre os diferenciais da Ampli estão: graduação 100% online sem necessidade de polo presencial, mensalidades a partir de valores baixos e parceladas, flexibilidade total para estudar de qualquer lugar e horário, diploma reconhecido pelo MEC com a mesma validade de cursos presenciais, ferramentas de empregabilidade conectadas ao mercado, e suporte da estrutura do grupo Cogna, maior grupo educacional do Brasil.`,
    founded: 2020,
    type: 'PRIVADA' as const,
    campusCount: null,
    studentCount: null,
    coursesOffered: null,
    headquartersCity: null,
    headquartersState: null,
    mecRating: null,
    emecLink: 'https://emec.mec.gov.br/',
    modalities: ['EAD'],
    academicLevels: ['GRADUACAO'],
    highlights: [
      'Faculdade 100% digital, sem necessidade de polo presencial',
      'Mensalidades baixas e parceladas',
      'Flexibilidade total para estudar de qualquer lugar e horário',
      'Pertence ao grupo Cogna, maior grupo educacional do Brasil',
      'Diploma reconhecido pelo MEC, equivalente a cursos presenciais',
      'Plataforma com aulas em vídeo, tutoria online e biblioteca virtual',
    ],
    logoUrl: '/assets/ampli-logo.png',
    imageUrl: '',
    imageAlt: 'Logo da Ampli',
    keywords: [
      'ampli', 'faculdade ampli', 'ampli ead', 'ampli online',
      'ampli cursos', 'ampli bolsa', 'ampli graduação',
      'ampli mensalidade', 'ampli digital', 'ampli cogna',
    ],
    metaTitle: 'Faculdade Ampli - Graduação 100% Online com Mensalidades Baixas | Bolsa Click',
    metaDescription: 'Encontre bolsas e descontos na Ampli, faculdade 100% online do grupo Cogna. Graduação reconhecida pelo MEC, mensalidades acessíveis. Estude de onde quiser. Inscreva-se!',
    isActive: true,
    order: 4,
  },
  {
    slug: 'unime',
    name: 'Unime',
    shortName: 'UNIME',
    fullName: 'União Metropolitana de Educação e Cultura - Unime',
    description: 'A Unime é uma instituição de ensino superior da Bahia, pertencente ao grupo Ser Educacional. Com campus em Lauro de Freitas, Salvador e Itabuna, destaca-se pela qualidade acadêmica com nota 4 no MEC e forte atuação na área de saúde.',
    longDescription: `A União Metropolitana de Educação e Cultura (Unime) foi fundada no ano 2000 na região metropolitana de Salvador, Bahia. Atualmente integra o grupo Ser Educacional, um dos maiores grupos de ensino superior do Brasil, presente em diversas regiões do país.

Com 5 campus localizados estrategicamente na Bahia — em Lauro de Freitas, Salvador e Itabuna — a Unime atende mais de 30 mil alunos em cursos presenciais, semipresenciais e EAD. A instituição se destaca por sua forte atuação na área de saúde, sendo referência em cursos como Medicina, Enfermagem, Odontologia e Fisioterapia.

A Unime oferece mais de 80 cursos de graduação e diversos programas de pós-graduação, com destaque para as áreas de Saúde, Direito, Engenharias e Gestão. Seus laboratórios e clínicas-escola são equipados com tecnologia de ponta, proporcionando uma formação prática e alinhada com as demandas do mercado de trabalho.

Reconhecida pelo MEC com nota institucional 4 (de 5), a Unime é uma das instituições mais bem avaliadas da Bahia. Essa excelência acadêmica é resultado de um corpo docente qualificado, com grande percentual de mestres e doutores, e de projetos de pesquisa e extensão que conectam os alunos à comunidade.

Entre os principais diferenciais da Unime estão: nota 4 no MEC, infraestrutura moderna com laboratórios de ponta, clínicas-escola na área de saúde, programas de monitoria e iniciação científica, parcerias com hospitais e empresas para estágio, e localização privilegiada na região metropolitana de Salvador.`,
    founded: 2000,
    type: 'PRIVADA' as const,
    campusCount: 5,
    studentCount: '30.000+',
    coursesOffered: 80,
    headquartersCity: 'Lauro de Freitas',
    headquartersState: 'BA',
    mecRating: 4,
    emecLink: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/NTI3',
    modalities: ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Nota 4 no MEC — uma das mais bem avaliadas da Bahia',
      'Referência na área de saúde com clínicas-escola próprias',
      'Laboratórios equipados com tecnologia de ponta',
      'Corpo docente com alto percentual de mestres e doutores',
      'Parcerias com hospitais e empresas para estágio',
      'Localização privilegiada na região metropolitana de Salvador',
    ],
    logoUrl: '/assets/logo-unime-p.png',
    imageUrl: '',
    imageAlt: 'Logo da Unime',
    keywords: [
      'unime', 'faculdade unime', 'unime salvador',
      'unime lauro de freitas', 'unime cursos', 'unime bolsa',
      'unime graduação', 'unime medicina', 'unime enfermagem',
      'unime bahia', 'unime nota mec',
    ],
    metaTitle: 'Faculdade Unime - Bolsas de Estudo na Bahia | Nota 4 no MEC | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na Faculdade Unime com desconto especial. Nota 4 no MEC, referência em saúde. Campus em Salvador, Lauro de Freitas e Itabuna. Inscreva-se grátis!',
    isActive: true,
    order: 5,
  },
  {
    slug: 'estacio',
    name: 'Estácio',
    shortName: 'ESTÁCIO',
    fullName: 'Universidade Estácio de Sá',
    description: 'A Estácio é uma das maiores universidades privadas do Brasil, pertencente ao grupo Yduqs. Com mais de 100 campus e polos em todo o país, oferece cursos de graduação, pós-graduação e EAD com tradição de mais de 50 anos em educação superior.',
    longDescription: `A Universidade Estácio de Sá foi fundada em 1970 no Rio de Janeiro e se consolidou como uma das maiores e mais tradicionais instituições de ensino superior privado do Brasil. Atualmente faz parte do grupo Yduqs, um dos maiores conglomerados educacionais do país.

Com mais de 100 campus e polos de educação a distância espalhados por todo o território brasileiro, a Estácio atende mais de 600 mil alunos em programas de graduação, pós-graduação, mestrado e doutorado. A universidade está presente em todos os estados brasileiros, com forte presença nos grandes centros urbanos.

A Estácio oferece mais de 500 cursos em todas as áreas do conhecimento, incluindo graduação presencial e EAD, pós-graduação lato sensu e stricto sensu, cursos livres e programas de extensão. Os cursos mais procurados são Direito, Administração, Engenharias, Pedagogia e cursos na área de Saúde.

Reconhecida pelo MEC com nota institucional 4, a Estácio se destaca pela qualidade acadêmica e pela abrangência de sua oferta educacional. A universidade investe em pesquisa e inovação, com diversos grupos de pesquisa cadastrados no CNPq e programas de mestrado e doutorado reconhecidos pela CAPES.

Os principais diferenciais da Estácio incluem: mais de 50 anos de tradição em educação, nota 4 no MEC, programas de mestrado e doutorado, ampla rede de campus presenciais e EAD, convênios com empresas para estágio e empregabilidade, biblioteca digital com acervo extenso, e desconto em cursos para alunos e ex-alunos.`,
    founded: 1970,
    type: 'PRIVADA' as const,
    campusCount: 100,
    studentCount: '600.000+',
    coursesOffered: 500,
    headquartersCity: 'Rio de Janeiro',
    headquartersState: 'RJ',
    mecRating: 4,
    emecLink: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/NTMw',
    modalities: ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Mais de 50 anos de tradição em educação superior',
      'Nota 4 no MEC com programas de mestrado e doutorado',
      'Mais de 100 campus e polos em todo o Brasil',
      'Ampla oferta de mais de 500 cursos',
      'Convênios com empresas para estágio e empregabilidade',
      'Biblioteca digital com acervo extenso e atualizado',
    ],
    logoUrl: '',
    imageUrl: '',
    imageAlt: 'Logo da Universidade Estácio de Sá',
    keywords: [
      'estacio', 'faculdade estacio', 'universidade estacio',
      'estacio ead', 'estacio cursos', 'estacio bolsa',
      'estacio graduação', 'estacio pós-graduação',
      'estacio mensalidade', 'estacio rio de janeiro',
    ],
    metaTitle: 'Faculdade Estácio - Bolsas de Estudo com até 70% de Desconto | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na Faculdade Estácio com descontos exclusivos. Nota 4 no MEC, mais de 50 anos de tradição. 100+ campus pelo Brasil. Inscreva-se grátis!',
    isActive: true,
    order: 6,
  },
  {
    slug: 'ibmec',
    name: 'IBMEC',
    shortName: 'IBMEC',
    fullName: 'Instituto Brasileiro de Mercado de Capitais - IBMEC',
    description: 'O IBMEC é uma instituição de ensino superior de excelência, focada em negócios, direito e engenharia. Com nota máxima 5 no MEC e pertencente ao grupo Yduqs, é referência em formação executiva e empreendedorismo no Brasil.',
    longDescription: `O Instituto Brasileiro de Mercado de Capitais (IBMEC) foi fundado em 1970 no Rio de Janeiro como centro de pesquisa em finanças e mercado de capitais. Ao longo de mais de 50 anos, evoluiu para uma das instituições de ensino superior mais prestigiadas do Brasil, especialmente nas áreas de Negócios, Direito, Economia e Engenharia. Atualmente faz parte do grupo Yduqs.

Com campus em São Paulo, Rio de Janeiro, Belo Horizonte e Brasília, o IBMEC atende cerca de 15 mil alunos em programas de graduação, pós-graduação, MBA e mestrado. A instituição é reconhecida como centro de excelência em formação executiva e empreendedorismo.

O IBMEC oferece cursos altamente seletivos nas áreas de Administração, Economia, Direito, Engenharias e Relações Internacionais. Seus programas de MBA e pós-graduação são referência no mercado, com professores que atuam como executivos e consultores em grandes empresas.

Com nota máxima 5 no MEC — a mais alta possível — o IBMEC está entre as melhores instituições de ensino superior do Brasil. A instituição se destaca pela excelência acadêmica, corpo docente altamente qualificado (100% mestres e doutores), metodologia baseada em casos práticos e networking com o mercado.

Os diferenciais do IBMEC incluem: nota 5 no MEC (nota máxima), corpo docente 100% composto por mestres e doutores, metodologia de ensino baseada em estudos de caso, forte conexão com o mercado financeiro e corporativo, programas de intercâmbio com universidades internacionais, e uma rede de ex-alunos influente nos setores financeiro e empresarial.`,
    founded: 1970,
    type: 'PRIVADA' as const,
    campusCount: 4,
    studentCount: '15.000+',
    coursesOffered: 40,
    headquartersCity: 'Rio de Janeiro',
    headquartersState: 'RJ',
    mecRating: 5,
    emecLink: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/NTAw',
    modalities: ['PRESENCIAL'],
    academicLevels: ['GRADUACAO', 'POS_GRADUACAO'],
    highlights: [
      'Nota máxima 5 no MEC — excelência acadêmica reconhecida',
      'Corpo docente 100% formado por mestres e doutores',
      'Referência em negócios, finanças e direito no Brasil',
      'Metodologia baseada em estudos de caso práticos',
      'Programas de intercâmbio com universidades internacionais',
      'Rede de ex-alunos influente no mercado financeiro e corporativo',
    ],
    logoUrl: '',
    imageUrl: '',
    imageAlt: 'Logo do IBMEC',
    keywords: [
      'ibmec', 'faculdade ibmec', 'ibmec cursos',
      'ibmec administração', 'ibmec direito', 'ibmec economia',
      'ibmec mba', 'ibmec pós-graduação', 'ibmec bolsa',
      'ibmec nota mec', 'ibmec mensalidade',
    ],
    metaTitle: 'Faculdade IBMEC - Nota 5 no MEC | Bolsas de Estudo | Bolsa Click',
    metaDescription: 'Encontre bolsas de estudo na Faculdade IBMEC, instituição nota 5 no MEC. Referência em negócios, direito e engenharia. Campus em SP, RJ, BH e Brasília. Inscreva-se!',
    isActive: false,
    order: 7,
  },
]

async function main() {
  console.log('Seeding institutions...')

  for (const institution of institutions) {
    const result = await prisma.institution.upsert({
      where: { slug: institution.slug },
      update: institution,
      create: institution,
    })
    console.log(`  ✓ ${result.name} (${result.isActive ? 'ativa' : 'inativa'})`)
  }

  const count = await prisma.institution.count()
  console.log(`\nTotal: ${count} institutions seeded`)

  const active = await prisma.institution.count({ where: { isActive: true } })
  const inactive = await prisma.institution.count({ where: { isActive: false } })
  console.log(`  Ativas: ${active} | Inativas: ${inactive}`)
}

main()
  .catch((e) => {
    console.error('Error seeding institutions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
