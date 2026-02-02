export interface CursoMetadata {
  slug: string                // URL slug (ex: "administracao")
  apiCourseName: string       // Nome exato para busca na API (ex: "Administração - Bacharelado")
  name: string                // Nome curto (ex: "Administração")
  fullName: string            // Nome completo (ex: "Administração - Bacharelado")
  type: 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'
  nivel: 'GRADUACAO' | 'POS_GRADUACAO'
  description: string         // Descrição curta para meta description
  longDescription: string     // Descrição longa para conteúdo da página
  duration: string            // Duração média (ex: "4 anos")
  areas: string[]             // Áreas de atuação
  skills: string[]            // Habilidades desenvolvidas
  careerPaths: string[]       // Possibilidades de carreira
  averageSalary: string       // Faixa salarial média
  marketDemand: 'ALTA' | 'MEDIA' | 'BAIXA'
  image: string               // Caminho da imagem
  keywords: string[]          // Keywords para SEO
}

export const TOP_CURSOS: CursoMetadata[] = [
  {
    slug: 'administracao',
    apiCourseName: 'Administração',
    name: 'Administração',
    fullName: 'Administração - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Administração forma profissionais capacitados para gerenciar negócios, pessoas e recursos em empresas de todos os portes.',
    longDescription: 'A graduação em Administração prepara você para atuar em diversas áreas do mundo corporativo, desenvolvendo competências em gestão de pessoas, finanças, marketing, produção e estratégia empresarial. O profissional administrador é essencial em qualquer organização, sendo responsável por planejar, organizar, dirigir e controlar recursos para alcançar objetivos organizacionais.',
    duration: '4 anos',
    areas: [
      'Gestão de Pessoas',
      'Finanças Corporativas',
      'Marketing e Vendas',
      'Logística e Produção',
      'Planejamento Estratégico',
      'Empreendedorismo'
    ],
    skills: [
      'Liderança e gestão de equipes',
      'Análise financeira e orçamentária',
      'Planejamento estratégico',
      'Tomada de decisão',
      'Comunicação empresarial',
      'Visão sistêmica de negócios'
    ],
    careerPaths: [
      'Gerente Administrativo',
      'Analista de Recursos Humanos',
      'Consultor Empresarial',
      'Gestor Financeiro',
      'Coordenador de Marketing',
      'Empreendedor'
    ],
    averageSalary: 'R$ 4.500 a R$ 12.000',
    marketDemand: 'ALTA',
    image: '/assets/images/adm.jpg',
    keywords: [
      'administração',
      'curso de administração',
      'faculdade de administração',
      'graduação em administração',
      'administração ead',
      'administração presencial',
      'bacharelado administração'
    ]
  },
  {
    slug: 'direito',
    apiCourseName: 'Direito',
    name: 'Direito',
    fullName: 'Direito - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Direito forma profissionais para atuar na defesa da justiça, direitos e garantias individuais e coletivas.',
    longDescription: 'A graduação em Direito oferece formação completa em ciências jurídicas, capacitando o profissional para atuar em diferentes áreas do Direito. Durante o curso, você estudará legislação, jurisprudência, doutrina e desenvolverá habilidades de argumentação, interpretação e aplicação das leis. O bacharel em Direito pode seguir carreira como advogado, juiz, promotor, defensor público, delegado ou consultor jurídico.',
    duration: '5 anos',
    areas: [
      'Direito Civil',
      'Direito Penal',
      'Direito Trabalhista',
      'Direito Empresarial',
      'Direito Constitucional',
      'Direito Tributário'
    ],
    skills: [
      'Interpretação de leis',
      'Argumentação jurídica',
      'Oratória',
      'Redação de peças processuais',
      'Análise crítica',
      'Ética profissional'
    ],
    careerPaths: [
      'Advogado',
      'Juiz',
      'Promotor de Justiça',
      'Defensor Público',
      'Delegado',
      'Consultor Jurídico'
    ],
    averageSalary: 'R$ 5.000 a R$ 20.000+',
    marketDemand: 'ALTA',
    image: '/assets/images/direito.webp',
    keywords: [
      'direito',
      'curso de direito',
      'faculdade de direito',
      'graduação em direito',
      'direito ead',
      'advocacia'
    ]
  },
  {
    slug: 'enfermagem',
    apiCourseName: 'Enfermagem',
    name: 'Enfermagem',
    fullName: 'Enfermagem - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Enfermagem prepara profissionais para cuidar da saúde das pessoas em hospitais, clínicas e na atenção primária.',
    longDescription: 'A graduação em Enfermagem forma profissionais capacitados para prestar assistência integral à saúde, atuando em hospitais, clínicas, postos de saúde e atendimento domiciliar. Durante o curso, você aprenderá sobre anatomia, fisiologia, farmacologia, técnicas de enfermagem e gestão em saúde. O enfermeiro é fundamental no sistema de saúde, cuidando de pacientes, administrando medicamentos e coordenando equipes.',
    duration: '5 anos',
    areas: [
      'Enfermagem Hospitalar',
      'Saúde Pública',
      'Enfermagem Obstétrica',
      'UTI e Emergência',
      'Enfermagem Pediátrica',
      'Gestão em Saúde'
    ],
    skills: [
      'Cuidados de enfermagem',
      'Administração de medicamentos',
      'Primeiros socorros',
      'Gestão de equipes de saúde',
      'Humanização no atendimento',
      'Protocolos clínicos'
    ],
    careerPaths: [
      'Enfermeiro Hospitalar',
      'Enfermeiro de UTI',
      'Enfermeiro do Trabalho',
      'Enfermeiro Obstetra',
      'Gestor de Saúde',
      'Auditor em Saúde'
    ],
    averageSalary: 'R$ 3.500 a R$ 10.000',
    marketDemand: 'ALTA',
    image: '/assets/images/enfermagem.jpeg',
    keywords: [
      'enfermagem',
      'curso de enfermagem',
      'faculdade de enfermagem',
      'graduação em enfermagem',
      'enfermagem ead',
      'bacharelado enfermagem'
    ]
  },
  {
    slug: 'psicologia',
    apiCourseName: 'Psicologia',
    name: 'Psicologia',
    fullName: 'Psicologia - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Psicologia estuda o comportamento humano e forma profissionais para atuar em clínicas, empresas e instituições.',
    longDescription: 'A graduação em Psicologia oferece conhecimentos sobre processos mentais, emocionais e comportamentais do ser humano. Durante o curso, você estudará teorias psicológicas, métodos de avaliação, técnicas de intervenção e desenvolverá habilidades para atuar em diferentes contextos. O psicólogo pode trabalhar em clínicas, hospitais, escolas, empresas e instituições sociais, ajudando pessoas a superar desafios e promover saúde mental.',
    duration: '5 anos',
    areas: [
      'Psicologia Clínica',
      'Psicologia Organizacional',
      'Psicologia Escolar',
      'Psicologia Social',
      'Neuropsicologia',
      'Psicologia do Esporte'
    ],
    skills: [
      'Escuta ativa',
      'Avaliação psicológica',
      'Técnicas terapêuticas',
      'Análise comportamental',
      'Elaboração de laudos',
      'Ética profissional'
    ],
    careerPaths: [
      'Psicólogo Clínico',
      'Psicólogo Organizacional',
      'Psicólogo Escolar',
      'Neuropsicólogo',
      'Psicólogo Hospitalar',
      'Consultor de RH'
    ],
    averageSalary: 'R$ 3.000 a R$ 8.000',
    marketDemand: 'ALTA',
    image: '/assets/images/psicologia.jpg',
    keywords: [
      'psicologia',
      'curso de psicologia',
      'faculdade de psicologia',
      'graduação em psicologia',
      'psicologia ead',
      'bacharelado psicologia'
    ]
  },
  {
    slug: 'educacao-fisica',
    apiCourseName: 'Educação Física',
    name: 'Educação Física',
    fullName: 'Educação Física - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Educação Física forma profissionais para atuar com esportes, saúde e qualidade de vida.',
    longDescription: 'A graduação em Educação Física capacita profissionais para promover a saúde e o bem-estar através da atividade física. Durante o curso, você estudará anatomia, fisiologia do exercício, biomecânica, treinamento esportivo e gestão de academias. O profissional pode atuar em academias, clubes esportivos, clínicas de reabilitação e como personal trainer, ajudando pessoas a alcançar seus objetivos físicos.',
    duration: '4 anos',
    areas: [
      'Personal Trainer',
      'Treinamento Esportivo',
      'Gestão de Academias',
      'Reabilitação Física',
      'Educação Física Escolar',
      'Recreação e Lazer'
    ],
    skills: [
      'Prescrição de exercícios',
      'Avaliação física',
      'Técnicas de treinamento',
      'Nutrição esportiva',
      'Gestão de grupos',
      'Prevenção de lesões'
    ],
    careerPaths: [
      'Personal Trainer',
      'Professor de Educação Física',
      'Treinador Esportivo',
      'Gestor de Academia',
      'Preparador Físico',
      'Consultor em Esportes'
    ],
    averageSalary: 'R$ 3.000 a R$ 9.000',
    marketDemand: 'ALTA',
    image: '/assets/images/educacao-fisica.jpeg',
    keywords: [
      'educação física',
      'curso de educação física',
      'faculdade de educação física',
      'graduação em educação física',
      'educação física ead',
      'bacharelado educação física'
    ]
  },
  {
    slug: 'pedagogia',
    apiCourseName: 'Pedagogia',
    name: 'Pedagogia',
    fullName: 'Pedagogia - Licenciatura',
    type: 'LICENCIATURA',
    nivel: 'GRADUACAO',
    description: 'O curso de Pedagogia forma professores e educadores para atuar na educação infantil e anos iniciais do ensino fundamental.',
    longDescription: 'A graduação em Pedagogia prepara profissionais para atuar na educação, desenvolvendo competências em didática, psicologia da educação, gestão escolar e políticas educacionais. O pedagogo pode trabalhar como professor, coordenador pedagógico, orientador educacional ou em áreas relacionadas à educação corporativa e social. É essencial para quem deseja transformar vidas através do ensino.',
    duration: '4 anos',
    areas: [
      'Educação Infantil',
      'Anos Iniciais',
      'Gestão Escolar',
      'Orientação Educacional',
      'Educação Especial',
      'Pedagogia Empresarial'
    ],
    skills: [
      'Planejamento pedagógico',
      'Métodos de ensino',
      'Avaliação educacional',
      'Gestão de sala de aula',
      'Psicologia infantil',
      'Inclusão escolar'
    ],
    careerPaths: [
      'Professor de Educação Infantil',
      'Professor dos Anos Iniciais',
      'Coordenador Pedagógico',
      'Orientador Educacional',
      'Pedagogo Empresarial',
      'Consultor Educacional'
    ],
    averageSalary: 'R$ 2.500 a R$ 7.000',
    marketDemand: 'ALTA',
    image: '/assets/images/pedagogia.jpg',
    keywords: [
      'pedagogia',
      'curso de pedagogia',
      'faculdade de pedagogia',
      'graduação em pedagogia',
      'pedagogia ead',
      'licenciatura pedagogia'
    ]
  },
  {
    slug: 'analise-e-desenvolvimento-de-sistemas',
    apiCourseName: 'Análise e Desenvolvimento de Sistemas',
    name: 'Análise e Desenvolvimento de Sistemas',
    fullName: 'Análise e Desenvolvimento de Sistemas - Tecnólogo',
    type: 'TECNOLOGO',
    nivel: 'GRADUACAO',
    description: 'O curso de ADS forma profissionais para desenvolver software, aplicativos e sistemas web.',
    longDescription: 'A graduação em Análise e Desenvolvimento de Sistemas prepara profissionais para atuar no desenvolvimento de software, criando aplicações, sistemas web e mobile. Durante o curso, você aprenderá linguagens de programação, banco de dados, engenharia de software e metodologias ágeis. É um dos cursos mais procurados devido à alta demanda do mercado de tecnologia.',
    duration: '2,5 anos',
    areas: [
      'Desenvolvimento Web',
      'Desenvolvimento Mobile',
      'Banco de Dados',
      'Análise de Sistemas',
      'DevOps',
      'Segurança da Informação'
    ],
    skills: [
      'Programação',
      'Desenvolvimento web',
      'Banco de dados',
      'API e web services',
      'Metodologias ágeis',
      'Resolução de problemas'
    ],
    careerPaths: [
      'Desenvolvedor Full Stack',
      'Desenvolvedor Front-end',
      'Desenvolvedor Back-end',
      'Analista de Sistemas',
      'Arquiteto de Software',
      'Tech Lead'
    ],
    averageSalary: 'R$ 4.000 a R$ 15.000',
    marketDemand: 'ALTA',
    image: '/assets/images/analise-e-desenvolvimento-de-sistemas.jpeg',
    keywords: [
      'ads',
      'análise e desenvolvimento de sistemas',
      'curso de ads',
      'faculdade de ads',
      'graduação em ads',
      'ads ead',
      'tecnólogo ads'
    ]
  },
  {
    slug: 'gestao-de-recursos-humanos',
    apiCourseName: 'Gestão de Recursos Humanos',
    name: 'Gestão de Recursos Humanos',
    fullName: 'Gestão de Recursos Humanos - Tecnólogo',
    type: 'TECNOLOGO',
    nivel: 'GRADUACAO',
    description: 'O curso de Gestão de RH forma profissionais para gerenciar pessoas, recrutamento, seleção e desenvolvimento organizacional.',
    longDescription: 'A graduação em Gestão de Recursos Humanos capacita profissionais para gerenciar o capital humano das organizações. Durante o curso, você aprenderá sobre recrutamento e seleção, treinamento e desenvolvimento, gestão de desempenho, clima organizacional e legislação trabalhista. O gestor de RH é estratégico para atrair, reter e desenvolver talentos.',
    duration: '2 anos',
    areas: [
      'Recrutamento e Seleção',
      'Treinamento e Desenvolvimento',
      'Gestão de Desempenho',
      'Remuneração e Benefícios',
      'Clima Organizacional',
      'Legislação Trabalhista'
    ],
    skills: [
      'Gestão de pessoas',
      'Recrutamento',
      'Avaliação de desempenho',
      'Comunicação interpessoal',
      'Legislação trabalhista',
      'Desenvolvimento organizacional'
    ],
    careerPaths: [
      'Analista de RH',
      'Recrutador',
      'Gerente de RH',
      'Business Partner',
      'Consultor de RH',
      'Coordenador de T&D'
    ],
    averageSalary: 'R$ 3.500 a R$ 10.000',
    marketDemand: 'ALTA',
    image: '/assets/images/gestao-de-recursos-humanos.webp',
    keywords: [
      'gestão de recursos humanos',
      'curso de rh',
      'faculdade de rh',
      'graduação em rh',
      'rh ead',
      'tecnólogo rh'
    ]
  },
  {
    slug: 'marketing',
    apiCourseName: 'Marketing',
    name: 'Marketing',
    fullName: 'Marketing - Tecnólogo',
    type: 'TECNOLOGO',
    nivel: 'GRADUACAO',
    description: 'O curso de Marketing forma profissionais para criar estratégias de comunicação, branding e vendas.',
    longDescription: 'A graduação em Marketing prepara profissionais para planejar e executar estratégias de marketing digital, branding, comunicação e vendas. Durante o curso, você aprenderá sobre comportamento do consumidor, pesquisa de mercado, marketing digital, gestão de marcas e publicidade. O profissional de marketing é essencial para empresas que desejam crescer e se destacar no mercado.',
    duration: '2 anos',
    areas: [
      'Marketing Digital',
      'Branding',
      'Publicidade',
      'Gestão de Vendas',
      'Pesquisa de Mercado',
      'Mídias Sociais'
    ],
    skills: [
      'Estratégias de marketing',
      'Marketing digital',
      'Análise de dados',
      'Gestão de marcas',
      'Comunicação visual',
      'Criatividade'
    ],
    careerPaths: [
      'Analista de Marketing',
      'Gerente de Marketing',
      'Social Media',
      'Gestor de Tráfego',
      'Brand Manager',
      'Consultor de Marketing'
    ],
    averageSalary: 'R$ 3.500 a R$ 12.000',
    marketDemand: 'ALTA',
    image: '/assets/images/marketing.webp',
    keywords: [
      'marketing',
      'curso de marketing',
      'faculdade de marketing',
      'graduação em marketing',
      'marketing ead',
      'tecnólogo marketing'
    ]
  },
  {
    slug: 'ciencias-contabeis',
    apiCourseName: 'Ciências Contábeis',
    name: 'Ciências Contábeis',
    fullName: 'Ciências Contábeis - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Ciências Contábeis forma profissionais para gerenciar finanças, contabilidade e tributos de empresas.',
    longDescription: 'A graduação em Ciências Contábeis capacita profissionais para atuar na gestão financeira e contábil de organizações. Durante o curso, você estudará contabilidade geral, auditoria, perícia contábil, legislação tributária e análise financeira. O contador é fundamental para a saúde financeira das empresas, cuidando de impostos, balanços e demonstrações contábeis.',
    duration: '4 anos',
    areas: [
      'Contabilidade Empresarial',
      'Auditoria',
      'Perícia Contábil',
      'Planejamento Tributário',
      'Controladoria',
      'Consultoria Financeira'
    ],
    skills: [
      'Contabilidade geral',
      'Análise financeira',
      'Legislação tributária',
      'Auditoria',
      'Relatórios contábeis',
      'Gestão fiscal'
    ],
    careerPaths: [
      'Contador',
      'Auditor',
      'Analista Fiscal',
      'Controller',
      'Perito Contábil',
      'Consultor Tributário'
    ],
    averageSalary: 'R$ 4.000 a R$ 12.000',
    marketDemand: 'ALTA',
    image: '/assets/images/ciencias-contabeis.jpg',
    keywords: [
      'ciências contábeis',
      'curso de contabilidade',
      'faculdade de contabilidade',
      'graduação em contabilidade',
      'contabilidade ead',
      'bacharelado contábeis'
    ]
  },
  {
    slug: 'arquitetura-e-urbanismo',
    apiCourseName: 'Arquitetura e Urbanismo',
    name: 'Arquitetura e Urbanismo',
    fullName: 'Arquitetura e Urbanismo - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Arquitetura forma profissionais para projetar edificações, espaços urbanos e interiores.',
    longDescription: 'A graduação em Arquitetura e Urbanismo prepara profissionais para projetar edificações, planejar espaços urbanos e criar ambientes funcionais e esteticamente agradáveis. Durante o curso, você estudará desenho técnico, história da arquitetura, urbanismo, sustentabilidade e aprenderá a usar softwares de projeto. O arquiteto transforma sonhos em projetos concretos.',
    duration: '5 anos',
    areas: [
      'Projetos Arquitetônicos',
      'Design de Interiores',
      'Urbanismo',
      'Paisagismo',
      'Restauração de Patrimônios',
      'Arquitetura Sustentável'
    ],
    skills: [
      'Desenho técnico',
      'Softwares de projeto (AutoCAD, SketchUp)',
      'Criatividade',
      'Conhecimento estrutural',
      'Legislação urbana',
      'Gestão de obras'
    ],
    careerPaths: [
      'Arquiteto',
      'Designer de Interiores',
      'Urbanista',
      'Paisagista',
      'Gestor de Obras',
      'Consultor de Sustentabilidade'
    ],
    averageSalary: 'R$ 4.500 a R$ 15.000',
    marketDemand: 'MEDIA',
    image: '/assets/images/arquitetura-e-urbanismo.jpg',
    keywords: [
      'arquitetura',
      'curso de arquitetura',
      'faculdade de arquitetura',
      'graduação em arquitetura',
      'arquitetura ead',
      'bacharelado arquitetura'
    ]
  },
  {
    slug: 'nutricao',
    apiCourseName: 'Nutrição',
    name: 'Nutrição',
    fullName: 'Nutrição - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Nutrição forma profissionais para cuidar da alimentação e saúde das pessoas.',
    longDescription: 'A graduação em Nutrição capacita profissionais para promover a saúde através da alimentação adequada. Durante o curso, você estudará bioquímica, fisiologia, nutrição clínica, saúde pública e aprenderá a elaborar planos alimentares personalizados. O nutricionista trabalha em hospitais, clínicas, academias, escolas e na indústria alimentícia, melhorando a qualidade de vida das pessoas.',
    duration: '4 anos',
    areas: [
      'Nutrição Clínica',
      'Nutrição Esportiva',
      'Saúde Pública',
      'Nutrição Estética',
      'Alimentação Coletiva',
      'Indústria de Alimentos'
    ],
    skills: [
      'Avaliação nutricional',
      'Elaboração de dietas',
      'Educação alimentar',
      'Conhecimento em bioquímica',
      'Atendimento clínico',
      'Gestão de serviços de alimentação'
    ],
    careerPaths: [
      'Nutricionista Clínico',
      'Nutricionista Esportivo',
      'Nutricionista em Saúde Pública',
      'Consultor Nutricional',
      'Personal Diet',
      'Gestor de Alimentação Coletiva'
    ],
    averageSalary: 'R$ 3.500 a R$ 10.000',
    marketDemand: 'ALTA',
    image: '/assets/images/nutricao.jpg',
    keywords: [
      'nutrição',
      'curso de nutrição',
      'faculdade de nutrição',
      'graduação em nutrição',
      'nutrição ead',
      'bacharelado nutrição'
    ]
  },
  {
    slug: 'fisioterapia',
    apiCourseName: 'Fisioterapia',
    name: 'Fisioterapia',
    fullName: 'Fisioterapia - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Fisioterapia forma profissionais para reabilitar pacientes através de exercícios e terapias manuais.',
    longDescription: 'A graduação em Fisioterapia prepara profissionais para prevenir, diagnosticar e tratar disfunções do movimento. Durante o curso, você estudará anatomia, cinesiologia, técnicas de reabilitação, ortopedia e neurologia. O fisioterapeuta trabalha em hospitais, clínicas, centros de reabilitação, equipes esportivas e atendimento domiciliar, ajudando pessoas a recuperar movimentos e qualidade de vida.',
    duration: '5 anos',
    areas: [
      'Fisioterapia Ortopédica',
      'Fisioterapia Neurológica',
      'Fisioterapia Respiratória',
      'Fisioterapia Esportiva',
      'Fisioterapia Pélvica',
      'Fisioterapia Geriátrica'
    ],
    skills: [
      'Avaliação funcional',
      'Técnicas de reabilitação',
      'Massoterapia',
      'Exercícios terapêuticos',
      'Uso de equipamentos',
      'Tratamento de lesões'
    ],
    careerPaths: [
      'Fisioterapeuta Clínico',
      'Fisioterapeuta Esportivo',
      'Fisioterapeuta Hospitalar',
      'Fisioterapeuta do Trabalho',
      'Consultor em Ergonomia',
      'Gestor de Clínica'
    ],
    averageSalary: 'R$ 3.500 a R$ 9.000',
    marketDemand: 'ALTA',
    image: '/assets/images/fisioterapia.jpg',
    keywords: [
      'fisioterapia',
      'curso de fisioterapia',
      'faculdade de fisioterapia',
      'graduação em fisioterapia',
      'fisioterapia ead',
      'bacharelado fisioterapia'
    ]
  },
  {
    slug: 'engenharia-civil',
    apiCourseName: 'Engenharia Civil',
    name: 'Engenharia Civil',
    fullName: 'Engenharia Civil - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Engenharia Civil forma profissionais para projetar, construir e gerenciar obras de infraestrutura.',
    longDescription: 'A graduação em Engenharia Civil capacita profissionais para planejar, projetar e gerenciar construções como prédios, pontes, estradas e sistemas de saneamento. Durante o curso, você estudará cálculo, física, materiais de construção, estruturas e gestão de obras. O engenheiro civil é essencial para o desenvolvimento urbano e infraestrutura do país.',
    duration: '5 anos',
    areas: [
      'Construção Civil',
      'Estruturas',
      'Geotecnia',
      'Hidráulica e Saneamento',
      'Transportes',
      'Gestão de Obras'
    ],
    skills: [
      'Cálculos estruturais',
      'Leitura de projetos',
      'Softwares de engenharia',
      'Gestão de obras',
      'Conhecimento de materiais',
      'Legislação técnica'
    ],
    careerPaths: [
      'Engenheiro Civil',
      'Engenheiro de Estruturas',
      'Engenheiro de Obras',
      'Gestor de Projetos',
      'Consultor Técnico',
      'Perito Judicial'
    ],
    averageSalary: 'R$ 5.000 a R$ 15.000',
    marketDemand: 'ALTA',
    image: '/assets/images/engenharia-civil.jpg',
    keywords: [
      'engenharia civil',
      'curso de engenharia civil',
      'faculdade de engenharia civil',
      'graduação em engenharia civil',
      'engenharia civil ead',
      'bacharelado engenharia'
    ]
  },
  {
    slug: 'engenharia-de-producao',
    apiCourseName: 'Engenharia de Produção',
    name: 'Engenharia de Produção',
    fullName: 'Engenharia de Produção - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Engenharia de Produção forma profissionais para otimizar processos industriais e logísticos.',
    longDescription: 'A graduação em Engenharia de Produção prepara profissionais para integrar recursos humanos, materiais e tecnológicos na produção de bens e serviços. Durante o curso, você estudará gestão de operações, qualidade, logística, planejamento e controle de produção. O engenheiro de produção é estratégico para aumentar eficiência e reduzir custos nas empresas.',
    duration: '5 anos',
    areas: [
      'Gestão de Operações',
      'Logística',
      'Qualidade',
      'Gestão de Projetos',
      'Planejamento de Produção',
      'Engenharia Econômica'
    ],
    skills: [
      'Otimização de processos',
      'Análise de dados',
      'Gestão da qualidade',
      'Logística empresarial',
      'Planejamento estratégico',
      'Ferramentas de gestão'
    ],
    careerPaths: [
      'Engenheiro de Produção',
      'Analista de Processos',
      'Gestor de Logística',
      'Gerente de Qualidade',
      'Consultor Industrial',
      'Coordenador de Projetos'
    ],
    averageSalary: 'R$ 5.500 a R$ 16.000',
    marketDemand: 'ALTA',
    image: '/assets/images/engenharia-de-producao.jpg',
    keywords: [
      'engenharia de produção',
      'curso de engenharia de produção',
      'faculdade de engenharia de produção',
      'graduação em engenharia de produção',
      'engenharia de produção ead',
      'bacharelado engenharia'
    ]
  },
  {
    slug: 'biomedicina',
    apiCourseName: 'Biomedicina',
    name: 'Biomedicina',
    fullName: 'Biomedicina - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Biomedicina forma profissionais para atuar em laboratórios, pesquisa e diagnóstico de doenças.',
    longDescription: 'A graduação em Biomedicina capacita profissionais para atuar em análises clínicas, pesquisa científica, diagnóstico por imagem e desenvolvimento de novas terapias. Durante o curso, você estudará biologia celular, microbiologia, imunologia, bioquímica e técnicas laboratoriais. O biomédico é fundamental para o diagnóstico de doenças e avanços na medicina.',
    duration: '4 anos',
    areas: [
      'Análises Clínicas',
      'Imagenologia',
      'Reprodução Humana',
      'Biologia Molecular',
      'Citologia',
      'Banco de Sangue'
    ],
    skills: [
      'Análises laboratoriais',
      'Microbiologia',
      'Interpretação de exames',
      'Pesquisa científica',
      'Biologia molecular',
      'Controle de qualidade'
    ],
    careerPaths: [
      'Biomédico de Laboratório',
      'Biomédico em Imagenologia',
      'Pesquisador',
      'Biomédico em Reprodução Humana',
      'Gestor de Laboratório',
      'Perito Criminal'
    ],
    averageSalary: 'R$ 3.500 a R$ 10.000',
    marketDemand: 'ALTA',
    image: '/assets/images/Biomedicina.jpeg',
    keywords: [
      'biomedicina',
      'curso de biomedicina',
      'faculdade de biomedicina',
      'graduação em biomedicina',
      'biomedicina ead',
      'bacharelado biomedicina'
    ]
  },
  {
    slug: 'odontologia',
    apiCourseName: 'Odontologia',
    name: 'Odontologia',
    fullName: 'Odontologia - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Odontologia forma profissionais para cuidar da saúde bucal e estética do sorriso.',
    longDescription: 'A graduação em Odontologia prepara profissionais para prevenir, diagnosticar e tratar doenças e problemas relacionados aos dentes e boca. Durante o curso, você estudará anatomia bucal, patologia, cirurgia, ortodontia e prótese dentária. O dentista cuida da saúde bucal e estética do sorriso, trabalhando em consultórios, clínicas, hospitais e saúde pública.',
    duration: '5 anos',
    areas: [
      'Clínica Geral',
      'Ortodontia',
      'Implantodontia',
      'Periodontia',
      'Endodontia',
      'Odontopediatria'
    ],
    skills: [
      'Diagnóstico bucal',
      'Procedimentos clínicos',
      'Técnicas cirúrgicas',
      'Estética dental',
      'Radiologia',
      'Atendimento ao paciente'
    ],
    careerPaths: [
      'Dentista Clínico Geral',
      'Ortodontista',
      'Implantodontista',
      'Periodontista',
      'Endodontista',
      'Odontopediatra'
    ],
    averageSalary: 'R$ 4.000 a R$ 15.000',
    marketDemand: 'ALTA',
    image: '/assets/images/odontologia.jpg',
    keywords: [
      'odontologia',
      'curso de odontologia',
      'faculdade de odontologia',
      'graduação em odontologia',
      'odontologia ead',
      'bacharelado odontologia'
    ]
  },
  {
    slug: 'gestao-comercial',
    apiCourseName: 'Gestão Comercial',
    name: 'Gestão Comercial',
    fullName: 'Gestão Comercial - Tecnólogo',
    type: 'TECNOLOGO',
    nivel: 'GRADUACAO',
    description: 'O curso de Gestão Comercial forma profissionais para gerenciar vendas, negociações e estratégias comerciais.',
    longDescription: 'A graduação em Gestão Comercial capacita profissionais para planejar e executar estratégias de vendas, negociações e gestão de equipes comerciais. Durante o curso, você aprenderá sobre técnicas de vendas, marketing, negociação, gestão de clientes e inteligência comercial. O gestor comercial é fundamental para empresas que desejam aumentar vendas e expandir mercados.',
    duration: '2 anos',
    areas: [
      'Gestão de Vendas',
      'Negociação',
      'Marketing Comercial',
      'Gestão de Clientes',
      'Inteligência Comercial',
      'E-commerce'
    ],
    skills: [
      'Técnicas de vendas',
      'Negociação',
      'Gestão de equipes',
      'Análise de mercado',
      'Relacionamento com clientes',
      'Estratégias comerciais'
    ],
    careerPaths: [
      'Gerente Comercial',
      'Supervisor de Vendas',
      'Analista Comercial',
      'Consultor de Vendas',
      'Account Manager',
      'Key Account Manager'
    ],
    averageSalary: 'R$ 4.000 a R$ 12.000',
    marketDemand: 'ALTA',
    image: '/assets/images/gestao-comercial.jpeg',
    keywords: [
      'gestão comercial',
      'curso de gestão comercial',
      'faculdade de gestão comercial',
      'graduação em gestão comercial',
      'gestão comercial ead',
      'tecnólogo gestão comercial'
    ]
  },
  {
    slug: 'farmacia',
    apiCourseName: 'Farmácia',
    name: 'Farmácia',
    fullName: 'Farmácia - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Farmácia forma profissionais para atuar com medicamentos, análises clínicas e cosméticos.',
    longDescription: 'A graduação em Farmácia prepara profissionais para atuar na produção, dispensação e análise de medicamentos, além de análises clínicas e desenvolvimento de cosméticos. Durante o curso, você estudará farmacologia, química farmacêutica, farmacotécnica, toxicologia e análises clínicas. O farmacêutico é essencial na promoção do uso racional de medicamentos e no cuidado com a saúde.',
    duration: '5 anos',
    areas: [
      'Farmácia Clínica',
      'Análises Clínicas',
      'Indústria Farmacêutica',
      'Farmácia Hospitalar',
      'Cosmetologia',
      'Farmácia de Manipulação'
    ],
    skills: [
      'Conhecimento em medicamentos',
      'Análises laboratoriais',
      'Atenção farmacêutica',
      'Controle de qualidade',
      'Farmacovigilância',
      'Gestão farmacêutica'
    ],
    careerPaths: [
      'Farmacêutico de Drogaria',
      'Farmacêutico Clínico',
      'Farmacêutico Analista',
      'Farmacêutico Industrial',
      'Farmacêutico Hospitalar',
      'Consultor Farmacêutico'
    ],
    averageSalary: 'R$ 3.500 a R$ 10.000',
    marketDemand: 'ALTA',
    image: '/assets/images/farmacia.jpeg',
    keywords: [
      'farmácia',
      'curso de farmácia',
      'faculdade de farmácia',
      'graduação em farmácia',
      'farmácia ead',
      'bacharelado farmácia'
    ]
  },
  {
    slug: 'medicina',
    apiCourseName: 'Medicina',
    name: 'Medicina',
    fullName: 'Medicina - Bacharelado',
    type: 'BACHARELADO',
    nivel: 'GRADUACAO',
    description: 'O curso de Medicina forma profissionais para diagnosticar, tratar e prevenir doenças.',
    longDescription: 'A graduação em Medicina é a formação mais completa na área da saúde, preparando profissionais para cuidar da vida humana. Durante o curso, você estudará anatomia, fisiologia, patologia, farmacologia, clínica médica, cirurgia e diversas especialidades. O médico é responsável por diagnosticar, tratar e prevenir doenças, atuando em hospitais, clínicas, pronto-socorros e consultórios particulares.',
    duration: '6 anos',
    areas: [
      'Clínica Médica',
      'Cirurgia',
      'Pediatria',
      'Ginecologia e Obstetrícia',
      'Cardiologia',
      'Ortopedia'
    ],
    skills: [
      'Diagnóstico clínico',
      'Exame físico',
      'Prescrição médica',
      'Procedimentos cirúrgicos',
      'Atendimento emergencial',
      'Humanização no atendimento'
    ],
    careerPaths: [
      'Médico Clínico Geral',
      'Médico Cirurgião',
      'Médico Pediatra',
      'Médico Cardiologista',
      'Médico do Trabalho',
      'Médico Legista'
    ],
    averageSalary: 'R$ 8.000 a R$ 30.000+',
    marketDemand: 'ALTA',
    image: '/assets/images/medicina.webp',
    keywords: [
      'medicina',
      'curso de medicina',
      'faculdade de medicina',
      'graduação em medicina',
      'medicina presencial',
      'bacharelado medicina'
    ]
  }
]

// Helper para buscar curso por slug
export function getCursoMetadataBySlug(slug: string): CursoMetadata | undefined {
  return TOP_CURSOS.find(curso => curso.slug === slug)
}

// Helper para gerar static params
export function getAllCursoSlugs(): string[] {
  return TOP_CURSOS.map(curso => curso.slug)
}
