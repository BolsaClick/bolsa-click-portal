// Perguntas e respostas específicas por curso — substitui o template genérico
// pra evitar "repetitive structure" do QRG Sept 2025 (thin content classifier).
// Pros cursos não listados, o page faz fallback pro template genérico.

export interface CourseFaqEntry {
  question: string
  answer: string
}

export const COURSE_FAQS: Record<string, CourseFaqEntry[]> = {
  psicologia: [
    {
      question: 'Psicologia pode ser feita EAD?',
      answer:
        'Não. O Conselho Federal de Psicologia (CFP) e o MEC não autorizam a graduação em Psicologia 100% EAD. Algumas faculdades oferecem modalidade semipresencial, com até 40% da carga em ambiente virtual, mas estágios supervisionados e disciplinas práticas exigem presença física.',
    },
    {
      question: 'Qual a diferença entre Psicologia e Psiquiatria?',
      answer:
        'Psicologia é uma graduação de bacharelado de 5 anos com formação em atendimento clínico, organizacional e educacional — o profissional não prescreve medicamento. Psiquiatria é uma especialização médica: o psiquiatra cursa Medicina (6 anos) + residência em Psiquiatria (3 anos) e pode prescrever.',
    },
    {
      question: 'Qual o salário de um psicólogo recém-formado?',
      answer:
        'Segundo o CAGED/Ministério do Trabalho (2024), o salário inicial de psicólogos com CLT é de R$ 2.500–R$ 3.800. Em consultório particular, valores variam por sessão (R$ 80–R$ 250 em capitais), com renda mensal entre R$ 5.000–R$ 15.000 conforme volume de pacientes.',
    },
    {
      question: 'Quanto custa Psicologia com bolsa pelo Bolsa Click?',
      answer:
        'As mensalidades de Psicologia com bolsa pelo Bolsa Click começam a partir de R$ 199/mês em faculdades parceiras como Anhanguera, Unopar e Pitágoras, com descontos de até 80% sobre o valor cheio. O percentual exato depende da unidade e do turno escolhido.',
    },
  ],

  direito: [
    {
      question: 'Direito pode ser feito EAD?',
      answer:
        'Não. A OAB e o MEC proíbem a graduação em Direito 100% EAD desde 2018. É permitido apenas o formato presencial ou semipresencial (com até 40% da carga horária em atividades online). Toda faculdade que prometer Direito EAD não tem reconhecimento oficial.',
    },
    {
      question: 'Quanto tempo dura a faculdade de Direito?',
      answer:
        'A graduação em Direito é um bacharelado de 5 anos (10 semestres), com carga horária mínima de 3.700 horas. Após formado, o estudante precisa ser aprovado no Exame de Ordem (OAB) pra exercer advocacia — outras carreiras jurídicas (magistratura, MP, defensoria) exigem concurso público.',
    },
    {
      question: 'Qual a nota de corte de Direito no SISU?',
      answer:
        'Em universidades públicas competitivas (USP, UFRJ, UnB, UFMG), a nota de corte de Direito no SISU costuma variar entre 720 e 790 pontos. Em faculdades particulares com bolsa pelo Bolsa Click, não há exigência de nota mínima — basta se cadastrar e escolher a unidade.',
    },
    {
      question: 'Quanto custa Direito em faculdade particular com bolsa?',
      answer:
        'Em faculdades particulares parceiras do Bolsa Click, Direito com bolsa começa a partir de R$ 399/mês em unidades como Anhanguera e Pitágoras, com descontos de até 80% sobre a mensalidade integral. Pra concorrer, basta cadastro gratuito.',
    },
  ],

  enfermagem: [
    {
      question: 'Enfermagem pode ser feita EAD?',
      answer:
        'Não totalmente. O COFEN e o MEC exigem que a graduação em Enfermagem seja presencial ou semipresencial — disciplinas teóricas podem ser EAD, mas estágios obrigatórios em hospitais, UBS e ambulatórios precisam ser presenciais (mínimo 800 horas de prática).',
    },
    {
      question: 'Qual a diferença entre Enfermagem e Técnico em Enfermagem?',
      answer:
        'Enfermagem é uma graduação de bacharelado de 5 anos — o enfermeiro coordena equipes, faz prescrição de cuidados e procedimentos complexos. Técnico em Enfermagem é um curso técnico de 2 anos (ensino médio) com atuação assistencial sob supervisão do enfermeiro, sem autonomia pra prescrever.',
    },
    {
      question: 'Quanto ganha um enfermeiro no Brasil?',
      answer:
        'O piso salarial nacional do enfermeiro é R$ 4.750 (Lei 14.434/2022). Na prática, salários em CLT variam de R$ 4.750 (concurso/CLT iniciante) a R$ 8.000+ (gerência, UTI, especialista). Em hospitais privados de alto padrão, enfermeiros especialistas podem ultrapassar R$ 12.000.',
    },
    {
      question: 'Quanto custa Enfermagem com bolsa pelo Bolsa Click?',
      answer:
        'Mensalidades de Enfermagem com bolsa começam a partir de R$ 299/mês em faculdades parceiras como Anhanguera, Unopar e Pitágoras, com descontos de até 80%. O valor varia por unidade, turno e modalidade (presencial/semipresencial).',
    },
  ],

  administracao: [
    {
      question: 'Administração EAD é reconhecido pelo MEC?',
      answer:
        'Sim. Administração é uma das graduações mais oferecidas em EAD no Brasil, totalmente reconhecida pelo MEC desde 2005. O diploma EAD tem o mesmo valor legal e profissional do presencial — não há distinção na carteira profissional.',
    },
    {
      question: 'Administração ou Gestão: qual a diferença?',
      answer:
        'Administração é um bacharelado de 4 anos com formação ampla (RH, marketing, finanças, operações). Gestão (Comercial, de RH, Financeira, etc) é um tecnólogo de 2-2,5 anos focado em uma área específica. Ambos têm reconhecimento MEC e habilitam pra mercado, mas Administração permite registro no CRA.',
    },
    {
      question: 'Qual o salário de um administrador?',
      answer:
        'Segundo o CAGED 2024, o salário médio de administradores no Brasil é R$ 4.200. Recém-formados começam em R$ 2.500–R$ 3.500; profissionais sênior em multinacionais chegam a R$ 12.000–R$ 25.000. MBA e especialização aceleram crescimento salarial.',
    },
    {
      question: 'Quanto custa Administração com bolsa pelo Bolsa Click?',
      answer:
        'Mensalidades de Administração com bolsa começam a partir de R$ 149/mês em modalidade EAD em faculdades parceiras como Anhanguera e Unopar. Descontos chegam a 80% sobre o valor cheio.',
    },
  ],

  pedagogia: [
    {
      question: 'Pedagogia EAD habilita pra dar aula?',
      answer:
        'Sim. Pedagogia EAD reconhecida pelo MEC habilita pra atuar em Educação Infantil, Anos Iniciais do Ensino Fundamental, gestão escolar e coordenação pedagógica. O diploma EAD tem o mesmo valor do presencial em concursos públicos e contratação privada.',
    },
    {
      question: 'Quanto tempo dura a faculdade de Pedagogia?',
      answer:
        'Pedagogia é uma licenciatura de 4 anos (8 semestres) com carga horária mínima de 3.200 horas, incluindo 400 horas de estágio supervisionado em escolas. Algumas faculdades oferecem em formato intensivo de 3,5 anos.',
    },
    {
      question: 'Qual o salário inicial de um pedagogo?',
      answer:
        'O piso nacional do magistério em 2024 é R$ 4.580 (40h/semana, jornada plena). Em redes municipais menores, salários iniciais variam de R$ 2.500 a R$ 3.800. Coordenadores pedagógicos e diretores em redes privadas premium chegam a R$ 8.000–R$ 12.000.',
    },
    {
      question: 'Quanto custa Pedagogia EAD com bolsa?',
      answer:
        'Mensalidades de Pedagogia EAD com bolsa começam a partir de R$ 99/mês em faculdades parceiras do Bolsa Click. Descontos podem chegar a 80% sobre o valor cheio, dependendo da unidade.',
    },
  ],

  'educacao-fisica': [
    {
      question: 'Qual a diferença entre Licenciatura e Bacharelado em Educação Física?',
      answer:
        'Licenciatura forma o professor de Educação Física pra dar aula em escolas (Educação Básica). Bacharelado forma o profissional pra atuar em academias, clubes, personal trainer, preparação física, reabilitação. São graduações distintas — quem quer ambas precisa cursar separadamente.',
    },
    {
      question: 'Educação Física pode ser EAD?',
      answer:
        'A Licenciatura em Educação Física pode ser cursada em modalidade semipresencial (com até 40% online). O Bacharelado também — mas estágios práticos e disciplinas como Fisiologia do Exercício e Cinesiologia exigem aulas presenciais. Não existe Educação Física 100% EAD com reconhecimento MEC.',
    },
    {
      question: 'Quanto ganha um profissional de Educação Física?',
      answer:
        'Salários variam por área: professor escolar (CLT/concurso) ganha R$ 3.500–R$ 5.500; personal trainer autônomo cobra R$ 70–R$ 200/hora; preparadores físicos em clubes profissionais ganham R$ 6.000–R$ 15.000+. O CREF é o registro obrigatório pra atuar.',
    },
    {
      question: 'Quanto custa Educação Física com bolsa?',
      answer:
        'Mensalidades começam a partir de R$ 199/mês em faculdades parceiras como Anhanguera, Pitágoras e Unime, com descontos de até 80% pelo Bolsa Click. Valores variam por modalidade (Licenciatura ou Bacharelado) e turno.',
    },
  ],

  'engenharia-civil': [
    {
      question: 'Engenharia Civil EAD é reconhecida pelo MEC?',
      answer:
        'Sim, desde 2023. O MEC autorizou Engenharia Civil em modalidade EAD com algumas exigências: laboratórios presenciais em polos credenciados, estágio obrigatório em obras reais e provas presenciais. O CREA aceita o registro de engenheiros formados em EAD reconhecido.',
    },
    {
      question: 'Quanto tempo dura Engenharia Civil?',
      answer:
        'Engenharia Civil é um bacharelado de 5 anos (10 semestres) com carga horária mínima de 3.600 horas. Inclui estágio obrigatório, projeto final de curso (TCC) e disciplinas de cálculo estrutural, materiais, hidráulica, geotecnia e gestão de obras.',
    },
    {
      question: 'Qual o salário de um engenheiro civil?',
      answer:
        'Salário inicial CLT: R$ 4.000–R$ 6.500. Em construtoras de grande porte ou multinacionais, engenheiros sênior ganham R$ 10.000–R$ 20.000+. Autônomos com carteira de clientes e ART de obras de alto padrão podem faturar R$ 15.000–R$ 50.000/mês. Registro no CREA é obrigatório.',
    },
    {
      question: 'Quanto custa Engenharia Civil com bolsa?',
      answer:
        'Mensalidades começam a partir de R$ 399/mês em faculdades parceiras do Bolsa Click. Em modalidade EAD reconhecida pelo MEC, valores podem ser ainda menores. Descontos de até 80% sobre o valor cheio.',
    },
  ],

  fisioterapia: [
    {
      question: 'Fisioterapia pode ser EAD?',
      answer:
        'Não. O COFFITO e o MEC não autorizam Fisioterapia em modalidade 100% EAD por exigir prática presencial intensiva. Algumas faculdades oferecem semipresencial, mas disciplinas práticas (cinesioterapia, eletroterapia, estágios) precisam ser presenciais.',
    },
    {
      question: 'Quanto tempo dura Fisioterapia?',
      answer:
        'Fisioterapia é um bacharelado de 5 anos (10 semestres) com carga horária mínima de 4.000 horas, incluindo 800h de estágios obrigatórios em hospitais, clínicas e ambulatórios. O registro no CREFITO é obrigatório pra atuar.',
    },
    {
      question: 'Qual o salário de um fisioterapeuta?',
      answer:
        'O piso da categoria varia por estado (R$ 2.500–R$ 4.500). Em hospitais públicos e privados, salários CLT vão de R$ 3.500 a R$ 7.000. Fisioterapeutas autônomos com consultório próprio cobram R$ 100–R$ 250 por sessão, com renda mensal entre R$ 6.000 e R$ 18.000.',
    },
    {
      question: 'Quanto custa Fisioterapia com bolsa?',
      answer:
        'Mensalidades começam a partir de R$ 399/mês em faculdades parceiras como Anhanguera e Pitágoras. Descontos chegam a 80% pelo Bolsa Click — valor exato depende da unidade e do turno.',
    },
  ],

  nutricao: [
    {
      question: 'Nutrição pode ser EAD?',
      answer:
        'Não totalmente. O CFN e o MEC não autorizam Nutrição 100% EAD. É permitido semipresencial (com até 40% online), mas disciplinas práticas como Avaliação Nutricional, Dietética e Estágio em UAN/hospital exigem presença física.',
    },
    {
      question: 'Quanto tempo dura Nutrição?',
      answer:
        'Nutrição é um bacharelado de 4 anos (8 semestres) com carga horária mínima de 3.200 horas, incluindo 800h de estágios em hospital, UAN (Unidade de Alimentação e Nutrição), saúde pública e clínica.',
    },
    {
      question: 'Quanto ganha um nutricionista?',
      answer:
        'Salário inicial CLT: R$ 2.500–R$ 4.000. Em hospitais e indústria de alimentos, sênior ganha R$ 5.500–R$ 9.000. Nutricionistas autônomas (consultório, esportiva, online) cobram R$ 150–R$ 400 por consulta, com renda mensal de R$ 6.000–R$ 20.000 conforme demanda.',
    },
    {
      question: 'Quanto custa Nutrição com bolsa?',
      answer:
        'Mensalidades começam a partir de R$ 299/mês em faculdades parceiras como Anhanguera e Pitágoras, com bolsas de até 80% pelo Bolsa Click.',
    },
  ],

  odontologia: [
    {
      question: 'Odontologia pode ser feita EAD?',
      answer:
        'Não. O Conselho Federal de Odontologia (CFO) e o MEC não autorizam a graduação em Odontologia 100% EAD. O curso exige carga prática intensiva em laboratórios e clínicas-escola — atendimento a pacientes, dentística, cirurgia e radiologia precisam ser presenciais. É permitida apenas parte teórica em formato semipresencial.',
    },
    {
      question: 'Quanto tempo dura a faculdade de Odontologia?',
      answer:
        'Odontologia é um bacharelado de 5 anos (10 semestres), com carga horária mínima de 4.000 horas e estágios obrigatórios em clínica-escola. Após formado, o cirurgião-dentista registra-se no CRO do seu estado pra atuar — especializações como Ortodontia e Implantodontia exigem cursos adicionais reconhecidos pelo CFO.',
    },
    {
      question: 'Qual o salário de um dentista recém-formado?',
      answer:
        'Em consultórios e clínicas, dentistas recém-formados em CLT ganham entre R$ 4.000 e R$ 6.000. Profissionais com consultório próprio ou especialização (Ortodontia, Implantodontia) chegam a R$ 10.000–R$ 15.000+, com renda variável por procedimento. O setor público (concursos, saúde da família) oferece estabilidade com salários a partir de R$ 5.000.',
    },
    {
      question: 'Quanto custa Odontologia com bolsa pelo Bolsa Click?',
      answer:
        'Odontologia é um dos cursos com mensalidade mais alta por exigir laboratórios e clínica-escola, mas a bolsa pelo Bolsa Click chega a 80% sobre o valor cheio. O preço exato varia por faculdade parceira, unidade e turno — confira os valores reais nas ofertas listadas nesta página antes de se inscrever (cadastro gratuito).',
    },
  ],

  biomedicina: [
    {
      question: 'Biomedicina pode ser feita EAD?',
      answer:
        'Não totalmente. O MEC permite Biomedicina em formato semipresencial — disciplinas teóricas podem ser online, mas as aulas práticas de análises clínicas, microbiologia, biologia molecular e os estágios em laboratório exigem presença física. Não existe Biomedicina 100% EAD com reconhecimento oficial.',
    },
    {
      question: 'O que faz um biomédico?',
      answer:
        'O biomédico atua em análises clínicas (exames de sangue, urina, microbiologia), diagnóstico por imagem, biologia molecular, reprodução humana, banco de sangue e perícia criminal. É o profissional habilitado a assumir responsabilidade técnica por laboratórios. São mais de 30 habilitações reconhecidas pelo Conselho Federal de Biomedicina (CFBM).',
    },
    {
      question: 'Quanto tempo dura o curso de Biomedicina?',
      answer:
        'Biomedicina é um bacharelado de 4 anos (8 semestres), com estágios obrigatórios em laboratórios de análises clínicas, pesquisa ou imagenologia. Após a formatura, o registro no CRBM do estado é obrigatório pra atuar, e habilitações específicas (como imagenologia ou reprodução humana) podem exigir aperfeiçoamento posterior.',
    },
    {
      question: 'Quanto ganha um biomédico no Brasil?',
      answer:
        'O salário de biomédicos varia de R$ 3.500 a R$ 10.000 conforme a área e a região. Recém-formados em laboratórios de análises clínicas começam por volta de R$ 3.500–R$ 4.500; biomédicos responsáveis técnicos, em imagenologia ou na indústria farmacêutica chegam a R$ 7.000–R$ 10.000+. A área de reprodução humana costuma ser a mais bem remunerada.',
    },
  ],

  'analise-e-desenvolvimento-de-sistemas': [
    {
      question: 'ADS (Análise e Desenvolvimento de Sistemas) tem o mesmo valor que Ciência da Computação?',
      answer:
        'Tem reconhecimento MEC equivalente, mas formação diferente. ADS é tecnólogo de 2,5 anos focado em desenvolvimento (programação, banco de dados, web/mobile, sistemas). Ciência da Computação é bacharelado de 4 anos com base teórica forte (algoritmos, matemática, IA, sistemas operacionais). Pro mercado de programação júnior/pleno, ambos são aceitos.',
    },
    {
      question: 'ADS pode ser EAD?',
      answer:
        'Sim, totalmente. ADS é uma das graduações mais oferecidas em EAD com reconhecimento MEC pleno. Não há diferença legal ou de mercado entre o diploma EAD e presencial — empresas de tecnologia avaliam portfólio e código, não modalidade do curso.',
    },
    {
      question: 'Quanto ganha um analista de sistemas recém-formado?',
      answer:
        'Salário inicial CLT em São Paulo: R$ 3.500–R$ 6.500 (júnior). Em multinacionais e empresas de tecnologia, pleno ganha R$ 7.000–R$ 14.000 e sênior R$ 15.000–R$ 30.000+. Profissionais com inglês fluente e que trabalham remotamente pra empresas estrangeiras chegam a R$ 25.000–R$ 60.000.',
    },
    {
      question: 'Quanto custa ADS com bolsa?',
      answer:
        'Mensalidades de ADS começam a partir de R$ 99/mês em modalidade EAD em faculdades parceiras do Bolsa Click como Anhanguera e Unopar. Bolsas de até 80% sobre o valor cheio.',
    },
  ],
}
