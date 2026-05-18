// Seed 2 spokes do cluster plan SEO:
// 1. /blog/bolsa-sem-prouni — spoke do pillar /como-conseguir-bolsa-de-estudo
// 2. /blog/mensalidade-de-psicologia-com-bolsa — spoke do pillar /bolsas/saude
//
// Run: node scripts/seed-cluster-spokes.mjs
// Idempotente: usa upsert por slug.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const POST_SEM_PROUNI = {
  slug: 'bolsa-sem-prouni',
  title: 'Como conseguir bolsa de estudo sem ProUni — 5 alternativas que funcionam',
  excerpt:
    'Não passou no ProUni ou não atende requisitos? Veja 5 caminhos alternativos pra conseguir bolsa em faculdade particular sem precisar do programa federal.',
  metaTitle: 'Bolsa de Estudo Sem ProUni: 5 Alternativas em 2026 | Bolsa Click',
  metaDescription:
    'Bolsa sem ProUni: descubra 5 alternativas que funcionam hoje — FIES, Bolsa Click (até 80%), bolsas filantrópicas e mais. Sem ENEM, sem comprovação de renda.',
  keywords: [
    'bolsa sem prouni',
    'como conseguir bolsa sem prouni',
    'bolsa de estudo sem prouni',
    'alternativa ao prouni',
    'bolsa sem enem',
    'bolsa de estudo faculdade particular',
  ],
  tags: ['bolsa-de-estudo', 'prouni', 'alternativas'],
  readingTime: 6,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['bolsas-de-estudo', 'ensino-superior'],
  content: `<p>O ProUni é o programa de bolsa de estudo mais conhecido do Brasil — mas <strong>não é o único</strong>, nem o mais acessível pra todos. Se você não atingiu nota mínima no ENEM, não atende ao critério de renda, ou simplesmente perdeu o prazo do edital, ainda existem 5 caminhos que funcionam pra conseguir bolsa em faculdade particular.</p>

<h2>Por que considerar alternativas ao ProUni?</h2>

<p>O ProUni exige <strong>nota mínima de 450 no ENEM</strong> (sem zerar redação), renda familiar per capita até 1,5 salário mínimo (bolsa integral) ou 3 (bolsa parcial), e que a inscrição seja feita dentro do edital (2x por ano). Muita gente não se encaixa em algum desses critérios, ou precisa começar a faculdade fora do calendário do ProUni.</p>

<p>A boa notícia: o mercado de educação superior privada no Brasil é competitivo, e as faculdades têm <strong>vários programas de desconto próprios</strong> pra preencher vagas ociosas. Esses programas frequentemente são mais acessíveis que o ProUni.</p>

<h2>5 alternativas reais ao ProUni</h2>

<h3>1. Bolsa Click — descontos de até 80% sem ENEM</h3>

<p>O <a href="/">Bolsa Click</a> é uma plataforma gratuita que negocia descontos com as principais redes de faculdade particular do Brasil (Anhanguera, Unopar, Pitágoras, Unime, Ampli). Os descontos chegam a 80% sobre o valor da mensalidade cheia, e <strong>não exigem nota do ENEM, comprovação de renda ou CPF de parente</strong>.</p>

<p>O cadastro é 100% gratuito. Você escolhe o curso e a unidade, garante a bolsa antes da matrícula, e segue direto pra inscrição com a faculdade já com o desconto aplicado. Mensalidades começam a partir de R$ 99/mês em modalidades EAD.</p>

<h3>2. FIES — financiamento estudantil do governo</h3>

<p>O FIES (Fundo de Financiamento Estudantil) é diferente do ProUni: você não ganha desconto, mas <strong>financia 100% da mensalidade</strong> com juros baixos e começa a pagar só após formado. Os requisitos são parecidos com o ProUni (ENEM ≥ 450 + renda familiar até 3 salários mínimos per capita), mas as vagas costumam ser mais flexíveis.</p>

<p>O FIES tem editais 2x por ano e funciona em faculdades particulares conveniadas. Vale a pena pra quem não conseguiu bolsa integral no ProUni mas ainda precisa de ajuda pra arcar com mensalidades.</p>

<h3>3. Bolsa filantrópica em faculdades confessionais</h3>

<p>Faculdades religiosas como PUC, Mackenzie, Metodista, ULBRA e UNISC têm <strong>programas próprios de bolsa filantrópica</strong>. Os descontos variam de 25% a 100% e os requisitos são definidos por cada instituição — geralmente combinam baixa renda familiar comprovada com processo seletivo próprio.</p>

<p>Como isso depende de edital interno, vale procurar diretamente o setor de assistência estudantil da faculdade que te interessa. Os editais geralmente abrem 1x por ano, alinhados ao calendário acadêmico.</p>

<h3>4. Programa de bolsa da própria faculdade</h3>

<p>Muitas faculdades particulares têm <strong>descontos diretos para ingressantes</strong> — bolsa-vestibular, bolsa de mérito, desconto pra quem indica amigos, programa de bolsa permanência pra alunos com bom CR, e bolsa por modalidade (EAD geralmente é mais barato que presencial).</p>

<p>Anhanguera, Estácio, UniCesumar e outras grandes redes anunciam descontos sazonais (matrículas antecipadas, "vagas remanescentes"). Vale acompanhar redes sociais e site da faculdade alvo.</p>

<h3>5. Educa Mais Brasil e outros marketplaces</h3>

<p>Marketplaces concorrentes ao Bolsa Click — Educa Mais Brasil, Quero Bolsa, Vai de Bolsa — também oferecem descontos de até 70% em faculdades particulares sem exigência de ENEM. O catálogo varia: cada um tem parcerias com instituições diferentes.</p>

<p>Compare ofertas entre 2-3 marketplaces antes de decidir. Um pode ter desconto maior pra Psicologia em São Paulo enquanto outro tem desconto melhor pra Pedagogia EAD em Salvador.</p>

<h2>Qual escolher?</h2>

<p><strong>Sem ENEM ou pressa pra começar:</strong> Bolsa Click é o caminho mais rápido (cadastro online, sem prova, sem espera de edital).</p>

<p><strong>Renda baixa + boa nota no ENEM:</strong> tente ProUni primeiro (bolsa 100% gratuita); se não conseguir, vá pro FIES ou bolsa filantrópica.</p>

<p><strong>Quer faculdade EAD pelo menor preço possível:</strong> combine Bolsa Click com modalidade EAD — mensalidades a partir de R$ 99/mês.</p>

<p><strong>Tem desempenho acadêmico forte ou é atleta:</strong> investigue programas específicos da faculdade (bolsa-mérito, bolsa-atleta).</p>

<h2>Não desista da faculdade</h2>

<p>O Brasil tem mais de 30 mil faculdades particulares com algum tipo de bolsa ou desconto disponível. O ProUni é apenas <strong>uma das opções</strong> — e nem sempre a mais acessível pra cada perfil.</p>

<p>Pra começar a comparar bolsas sem ProUni hoje, <a href="/cursos">veja as ofertas disponíveis no Bolsa Click</a> ou leia nosso <a href="/como-conseguir-bolsa-de-estudo">guia completo de como conseguir bolsa de estudo</a> pra entender todas as opções em detalhe.</p>`,
}

const POST_MENSALIDADE_PSI = {
  slug: 'mensalidade-de-psicologia-com-bolsa',
  title: 'Quanto custa a mensalidade de Psicologia com bolsa de estudo? Valores 2026',
  excerpt:
    'Mensalidade de Psicologia varia de R$ 199 a R$ 2.500. Veja preços com bolsa em Anhanguera, Unopar e outras faculdades particulares, desconto médio e como economizar até 80%.',
  metaTitle: 'Mensalidade de Psicologia com Bolsa 2026: a partir de R$ 199 | Bolsa Click',
  metaDescription:
    'Mensalidade de Psicologia em faculdade particular: valor cheio R$ 1.200-R$ 2.500. Com bolsa pelo Bolsa Click, partir de R$ 199/mês. Veja preços por faculdade e cidade.',
  keywords: [
    'mensalidade de psicologia',
    'mensalidade psicologia com bolsa',
    'quanto custa psicologia',
    'valor faculdade de psicologia',
    'psicologia mensalidade 2026',
    'preço faculdade psicologia',
  ],
  tags: ['psicologia', 'mensalidade', 'bolsa-de-estudo'],
  readingTime: 5,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['bolsas-de-estudo', 'psicologia'],
  content: `<p>A mensalidade de <strong>Psicologia em faculdade particular no Brasil</strong> varia bastante: o valor cheio fica entre <strong>R$ 1.200 e R$ 2.500</strong> em capitais, enquanto com bolsa pelo Bolsa Click é possível pagar a partir de <strong>R$ 199/mês</strong>. Esse artigo detalha os valores reais praticados em 2026, por faculdade e modalidade.</p>

<h2>Quanto custa Psicologia sem bolsa?</h2>

<p>Em faculdades particulares de grande porte (Anhanguera, Unopar, Pitágoras, Unime, Estácio, UniCesumar), a mensalidade cheia de Psicologia em modalidade presencial está em:</p>

<ul>
<li><strong>São Paulo / Rio de Janeiro:</strong> R$ 1.800 a R$ 2.500/mês</li>
<li><strong>Capitais médias (BH, Curitiba, Porto Alegre, Salvador):</strong> R$ 1.400 a R$ 2.100/mês</li>
<li><strong>Cidades menores:</strong> R$ 1.200 a R$ 1.700/mês</li>
</ul>

<p>O curso tem duração média de <strong>5 anos (10 semestres)</strong>, então o investimento total sem bolsa fica entre R$ 72 mil e R$ 150 mil. É um dos cursos mais caros da área de saúde por exigir laboratórios práticos e supervisão clínica.</p>

<h2>Quanto custa Psicologia com bolsa pelo Bolsa Click?</h2>

<p>Com bolsas negociadas pelo Bolsa Click nas faculdades parceiras Cogna (Anhanguera, Unopar, Pitágoras, Unime, Ampli), os descontos chegam a 80% sobre o valor cheio. Os preços com bolsa em 2026 começam:</p>

<ul>
<li><strong>Modalidade semipresencial:</strong> a partir de R$ 199/mês</li>
<li><strong>Modalidade presencial (cidades pequenas):</strong> a partir de R$ 299/mês</li>
<li><strong>Modalidade presencial (capitais):</strong> a partir de R$ 399/mês</li>
</ul>

<p>Em 5 anos, o investimento total com bolsa cai pra R$ 12 mil a R$ 24 mil — uma economia de até R$ 130 mil sobre o valor cheio.</p>

<h2>Psicologia EAD é mais barato?</h2>

<p>Importante: <strong>Psicologia 100% EAD não é autorizada pelo MEC</strong>. O Conselho Federal de Psicologia (CFP) e o MEC só permitem a graduação em formato presencial ou semipresencial (com até 40% das aulas online). Por isso, "Psicologia EAD" não existe oficialmente — quem oferece pode ter o diploma não-reconhecido.</p>

<p>O que existe é Psicologia semipresencial, com aulas teóricas online e disciplinas práticas + estágios presenciais. Essa modalidade é mais barata que a 100% presencial e <strong>tem reconhecimento MEC pleno</strong>.</p>

<h2>O que está incluído na mensalidade?</h2>

<p>A mensalidade da faculdade <strong>geralmente cobre apenas as aulas regulares</strong>. Custos extras que geralmente são à parte:</p>

<ul>
<li>Matrícula inicial (uma única vez, R$ 100-R$ 500)</li>
<li>Material didático (livros, apostilas — R$ 200-R$ 500/semestre)</li>
<li>Taxas de estágio supervisionado em clínica (a partir do 7º semestre)</li>
<li>Taxa de defesa de TCC e colação de grau</li>
<li>Atendimento clínico-escola obrigatório (algumas faculdades cobram à parte)</li>
</ul>

<p>Antes de fechar matrícula, peça pra faculdade uma planilha com todos os custos extras pros 5 anos — facilita comparação real entre instituições.</p>

<h2>Como economizar mais</h2>

<p><strong>Combine Bolsa Click com modalidade semipresencial.</strong> A diferença de preço entre presencial e semipresencial chega a 30% — somado ao desconto de até 80% do Bolsa Click, a mensalidade fica em R$ 199-R$ 299/mês na maioria das cidades.</p>

<p><strong>Escolha cidades menores se mora longe da capital.</strong> Mensalidade em cidade interior costuma ser 30-40% mais barata que em capital, e Anhanguera/Unopar têm polos em mais de 280 cidades brasileiras.</p>

<p><strong>Negocie matrículas antecipadas.</strong> Faculdades particulares anunciam descontos sazonais (matrícula até dezembro, "vagas remanescentes"). Combinado com bolsa Bolsa Click, dá pra reduzir mais alguns pontos.</p>

<h2>Próximo passo</h2>

<p>Pra ver os valores reais de Psicologia com bolsa por faculdade e cidade hoje, <a href="/cursos/psicologia">acesse a página de Psicologia no Bolsa Click</a> — você compara ofertas em tempo real com preço final mensal e percentual de desconto. Cadastro gratuito, sem ENEM, sem CPF de parente.</p>

<p>Veja também nosso <a href="/bolsas/saude">guia completo de bolsas em faculdades de saúde</a> e o <a href="/como-conseguir-bolsa-de-estudo">comparativo de todos os programas de bolsa disponíveis no Brasil</a>.</p>`,
}

async function upsertPost(post) {
  const { categories: catSlugs, ...data } = post

  // Busca os IDs das categorias
  const cats = await prisma.blogCategory.findMany({
    where: { slug: { in: catSlugs } },
    select: { id: true, slug: true },
  })

  if (cats.length !== catSlugs.length) {
    const found = cats.map((c) => c.slug)
    const missing = catSlugs.filter((s) => !found.includes(s))
    console.warn(`⚠️  ${post.slug}: categorias não encontradas: ${missing.join(', ')}`)
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })

  if (existing) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: {
        ...data,
        publishedAt: existing.publishedAt ?? new Date(),
        isActive: true,
        categories: {
          set: cats.map((c) => ({ id: c.id })),
        },
      },
    })
    console.log(`🔄 ${post.slug}: atualizado`)
  } else {
    await prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: new Date(),
        isActive: true,
        categories: {
          connect: cats.map((c) => ({ id: c.id })),
        },
      },
    })
    console.log(`✅ ${post.slug}: criado`)
  }
}

const POST_EAD_TRABALHO = {
  slug: 'bolsa-ead-para-quem-trabalha',
  title: 'Faculdade EAD para quem trabalha: 5 critérios pra escolher em 2026',
  excerpt:
    'Combinar trabalho e graduação não precisa ser sofrimento. Veja como escolher uma faculdade EAD que se encaixa na rotina de quem trabalha 40h/semana, com bolsa pelo Bolsa Click.',
  metaTitle: 'Faculdade EAD para Quem Trabalha 2026 | Bolsa Click',
  metaDescription:
    'Faculdade EAD para quem trabalha: 5 critérios essenciais (flexibilidade, polo próximo, custo, reconhecimento MEC). Bolsa de até 80% pelo Bolsa Click.',
  keywords: [
    'faculdade ead para quem trabalha',
    'bolsa ead trabalho',
    'graduação para quem trabalha',
    'faculdade ead noturno',
    'curso superior trabalhando',
  ],
  tags: ['ead', 'graduacao', 'bolsa-de-estudo'],
  readingTime: 5,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['ead', 'graduacao'],
  content: `<p>Trabalhar 40 horas semanais e ainda cursar uma graduação parecia impossível há 15 anos. Hoje, com a expansão da modalidade EAD reconhecida pelo MEC, é a rota mais comum de quem retoma os estudos depois dos 25 anos. Esse artigo lista 5 critérios objetivos pra escolher a <strong>faculdade EAD certa pra quem trabalha</strong>.</p>

<h2>1. Flexibilidade real das aulas</h2>

<p>"EAD" não significa todas as aulas no horário que você quiser. Algumas faculdades exigem aulas ao vivo (transmissão síncrona) em horários fixos — ruim pra quem trabalha em turno comercial. Pergunte: <strong>as videoaulas são gravadas (assíncrono) ou ao vivo (síncrono)?</strong> Procure 100% assíncrono se sua rotina não permite logar em horário comercial.</p>

<p>Anhanguera, Unopar e Pitágoras (todas no <a href="/">Bolsa Click</a>) oferecem aulas gravadas com prazo flexível pra assistir — geralmente uma semana por vídeo.</p>

<h2>2. Polo presencial próximo de casa</h2>

<p>Mesmo cursos EAD têm <strong>provas e atividades práticas presenciais</strong> no polo da faculdade — geralmente 1x por bimestre. Antes de matricular, confirme: existe polo da faculdade na sua cidade? Quão longe fica? Tem estacionamento? Funciona aos sábados?</p>

<p>A rede Cogna (Anhanguera, Unopar, Pitágoras, Unime, Ampli) tem mais de 1.500 polos no Brasil — a maior rede do país. Bolsa Click mostra o polo mais próximo de cada oferta.</p>

<h2>3. Reconhecimento MEC do curso</h2>

<p>Cursos EAD precisam ter <strong>reconhecimento explícito do MEC pra ter validade legal</strong>. Verifique no portal e-MEC (gratuito) se o curso tem nota mínima 3 na avaliação. Cursos com nota 4-5 são preferíveis (concursos públicos e empresas premium podem dar peso).</p>

<p>Direito, Medicina, Odontologia e Psicologia (100%) <strong>não podem ser EAD por proibição de conselho profissional</strong>. Se alguém oferece, fuja — o diploma não vale.</p>

<h2>4. Custo total real, não só mensalidade</h2>

<p>Mensalidade EAD com bolsa pelo Bolsa Click parte de R$ 99/mês — mas <strong>cuidado com custos ocultos</strong>:</p>

<ul>
<li>Matrícula inicial (R$ 100-500)</li>
<li>Material didático (R$ 200-500/semestre)</li>
<li>Taxa de TCC e colação de grau</li>
<li>Deslocamento ao polo (combustível, transporte)</li>
<li>Taxa de estágio supervisionado em algumas profissões</li>
</ul>

<p>Antes de fechar matrícula, peça pra faculdade uma <strong>planilha completa de custos pros 4-5 anos</strong>. Compara real com outras opções.</p>

<h2>5. Suporte e tutoria responsivos</h2>

<p>Quem trabalha não tem tempo pra perder esperando dúvida ser respondida 3 dias depois. Antes de matricular, teste: contate o suporte da faculdade fazendo uma pergunta simples. Quanto demora pra responder? A resposta é genérica (FAQ) ou personalizada?</p>

<p>Plataformas EAD modernas têm <strong>chat ao vivo + tutoria via WhatsApp</strong> — peça pra fazer um tour da plataforma antes de assinar contrato.</p>

<h2>Combine bolsa + curso certo</h2>

<p>Pra quem trabalha, a equação ideal é: <strong>curso EAD reconhecido MEC + polo próximo + flexibilidade total + bolsa Bolsa Click</strong>. Os cursos com maior procura nessa combinação:</p>

<ul>
<li><a href="/cursos/administracao">Administração</a> — clássico pra quem já trabalha, agrega gestão direto pro currículo</li>
<li><a href="/cursos/pedagogia">Pedagogia</a> — habilita pra concurso público de professor + redes privadas</li>
<li><a href="/cursos/analise-e-desenvolvimento-de-sistemas">ADS</a> — tecnólogo de 2,5 anos, mercado aquecido em tech</li>
<li><a href="/cursos/gestao-de-recursos-humanos">Gestão de RH</a> — tecnólogo de 2 anos, alta empregabilidade</li>
</ul>

<p>Veja todos os <a href="/faculdade-ead">cursos EAD disponíveis com bolsa</a> ou explore nosso <a href="/como-conseguir-bolsa-de-estudo">guia completo de como conseguir bolsa</a>.</p>`,
}

const POST_DIREITO_MENSALIDADE = {
  slug: 'mensalidade-de-direito-faculdade-particular',
  title: 'Mensalidade de Direito em faculdade particular: valores 2026',
  excerpt:
    'Mensalidade de Direito em faculdade particular varia de R$ 1.500 a R$ 3.500. Com bolsa pelo Bolsa Click, parte de R$ 399. Compare valores por cidade, faculdade e modalidade.',
  metaTitle: 'Mensalidade de Direito em Faculdade Particular 2026 | A partir de R$ 399',
  metaDescription:
    'Quanto custa Direito em faculdade particular? Mensalidade cheia R$ 1.500-R$ 3.500. Com bolsa Bolsa Click, a partir de R$ 399/mês. Valores reais por cidade e faculdade.',
  keywords: [
    'mensalidade de direito',
    'mensalidade direito faculdade particular',
    'quanto custa direito',
    'valor faculdade de direito',
    'direito mensalidade 2026',
  ],
  tags: ['direito', 'mensalidade', 'bolsa-de-estudo'],
  readingTime: 5,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['bolsas-de-estudo', 'graduacao'],
  content: `<p>A mensalidade de Direito em faculdade particular é uma das mais altas entre as graduações no Brasil. Sem bolsa, o valor cheio varia de <strong>R$ 1.500 a R$ 3.500/mês</strong> em capitais. Com bolsa pelo Bolsa Click, é possível pagar <strong>a partir de R$ 399/mês</strong>. Esse artigo detalha valores reais por região e dicas pra economizar.</p>

<h2>Por que Direito é tão caro?</h2>

<p>Direito tem 4 razões pra mensalidade alta:</p>

<ul>
<li><strong>Demanda enorme</strong> — é o curso com mais matrículas no Brasil (mais de 1 milhão de estudantes ativos)</li>
<li><strong>Custo de credenciamento</strong> — OAB exige estrutura de Núcleo de Prática Jurídica obrigatório</li>
<li><strong>Corpo docente qualificado</strong> — advogados, juízes e promotores recebem hora-aula alta</li>
<li><strong>Proibição de EAD 100%</strong> — não pode ser oferecido em modalidade barata totalmente online</li>
</ul>

<h2>Valores cheios sem bolsa (2026)</h2>

<p>Em faculdades particulares de grande porte (Anhanguera, Unopar, Pitágoras, Estácio, UniCesumar):</p>

<ul>
<li><strong>São Paulo / Rio de Janeiro:</strong> R$ 2.500 a R$ 3.500/mês</li>
<li><strong>Capitais médias:</strong> R$ 1.800 a R$ 2.800/mês</li>
<li><strong>Cidades menores:</strong> R$ 1.500 a R$ 2.200/mês</li>
</ul>

<p>O curso dura 5 anos — investimento total sem bolsa: R$ 90 mil a R$ 210 mil.</p>

<h2>Valores com bolsa pelo Bolsa Click</h2>

<p>Com descontos negociados pelo Bolsa Click nas faculdades parceiras Cogna, os preços com bolsa em 2026:</p>

<ul>
<li><strong>Modalidade semipresencial (cidades menores):</strong> a partir de R$ 399/mês</li>
<li><strong>Presencial em cidades médias:</strong> a partir de R$ 599/mês</li>
<li><strong>Presencial em capitais:</strong> a partir de R$ 799/mês</li>
</ul>

<p>Em 5 anos, investimento com bolsa: R$ 24 mil a R$ 48 mil — economia de até R$ 160 mil sobre o valor cheio.</p>

<h2>Direito EAD existe?</h2>

<p><strong>Não totalmente.</strong> A OAB e o MEC <strong>proíbem a graduação em Direito 100% EAD</strong>. Algumas faculdades oferecem modalidade <strong>semipresencial</strong> (com até 40% das aulas online + presencial obrigatório). Toda faculdade que prometer Direito 100% online não tem reconhecimento — o diploma não habilita pra prestar OAB.</p>

<p>Antes de matricular, confira no portal e-MEC se o curso tem reconhecimento ativo.</p>

<h2>Custos extras de Direito (cuidado!)</h2>

<p>Mensalidade não é o único gasto. Em Direito, esses custos costumam ser à parte:</p>

<ul>
<li>Material didático (livros caros — R$ 400-800/semestre)</li>
<li>Vestimenta formal pra audiências e estágio</li>
<li>Núcleo de Prática Jurídica (algumas cobram taxa)</li>
<li>Inscrição no Exame de Ordem (R$ 525 em 2025)</li>
<li>Cursinho pra OAB (R$ 200-500/mês durante último ano — opcional mas comum)</li>
</ul>

<h2>Como economizar</h2>

<p><strong>1. Combine bolsa + semipresencial.</strong> Diferença entre presencial e semipresencial chega a 30% — somado ao desconto Bolsa Click, mensalidade fica em R$ 399-599.</p>

<p><strong>2. Escolha cidades de polo regional.</strong> Direito em Anhanguera de cidade média (Sorocaba, Maringá, Juiz de Fora) sai 30-40% mais barato que em capital.</p>

<p><strong>3. ProUni se você atingir requisitos.</strong> Renda familiar até 1,5 SM per capita + ENEM ≥ 450 = bolsa integral. Mas vagas em Direito são muito disputadas.</p>

<h2>Próximo passo</h2>

<p>Pra ver valores reais de Direito com bolsa por cidade e faculdade hoje, <a href="/cursos/direito">acesse a página de Direito no Bolsa Click</a>. Veja também nosso <a href="/como-conseguir-bolsa-de-estudo">guia completo de como conseguir bolsa de estudo</a> e o comparativo entre todos os programas disponíveis.</p>`,
}

const POST_EAD_BARATA = {
  slug: 'faculdade-ead-mais-barata',
  title: 'Faculdade EAD mais barata do Brasil 2026: comparativo de preços',
  excerpt:
    'Qual a faculdade EAD mais barata em 2026? Comparamos Anhanguera, Unopar, Pitágoras e outras parceiras do Bolsa Click. Mensalidades a partir de R$ 99/mês.',
  metaTitle: 'Faculdade EAD Mais Barata 2026: a partir de R$ 99/mês | Bolsa Click',
  metaDescription:
    'Faculdade EAD mais barata no Brasil: comparativo Anhanguera vs Unopar vs Pitágoras com bolsa Bolsa Click. Mensalidades de R$ 99 a R$ 399 conforme curso e modalidade.',
  keywords: [
    'faculdade ead mais barata',
    'faculdade ead barata',
    'curso ead barato',
    'graduação ead barata',
    'mensalidade ead baixa',
  ],
  tags: ['ead', 'bolsa-de-estudo', 'mensalidade'],
  readingTime: 4,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['ead', 'bolsas-de-estudo'],
  content: `<p>Não existe uma única "faculdade EAD mais barata" do Brasil — o preço varia por curso, cidade, modalidade e desconto disponível. Mas com bolsas negociadas pelo Bolsa Click, mensalidades EAD começam <strong>a partir de R$ 99/mês</strong> em parceiras como Anhanguera, Unopar, Pitágoras e Ampli. Esse artigo compara preços reais.</p>

<h2>Faculdades EAD mais baratas (com bolsa Bolsa Click)</h2>

<p>Os preços abaixo são valores reais com bolsa do Bolsa Click, em modalidade EAD ou semipresencial, em 2026. Mensalidades variam por curso e cidade — esses são pontos de partida:</p>

<ul>
<li><strong>Ampli (rede Cogna):</strong> a partir de R$ 99/mês em Administração, Pedagogia, ADS</li>
<li><strong>Unopar:</strong> a partir de R$ 129/mês em diversos cursos EAD</li>
<li><strong>Anhanguera EAD:</strong> a partir de R$ 149/mês em cursos populares</li>
<li><strong>Pitágoras:</strong> a partir de R$ 159/mês em modalidade EAD</li>
<li><strong>Unime:</strong> a partir de R$ 179/mês (mais comum em presencial)</li>
</ul>

<h2>Cursos EAD mais baratos</h2>

<p>Por tipo de curso, os mais acessíveis em modalidade EAD são:</p>

<ul>
<li><a href="/cursos/administracao">Administração EAD</a> — a partir de R$ 99/mês (4 anos, bacharelado)</li>
<li><a href="/cursos/pedagogia">Pedagogia EAD</a> — a partir de R$ 99/mês (4 anos, licenciatura)</li>
<li><a href="/cursos/gestao-de-recursos-humanos">Gestão de RH</a> — a partir de R$ 119/mês (2 anos, tecnólogo)</li>
<li><a href="/cursos/analise-e-desenvolvimento-de-sistemas">ADS</a> — a partir de R$ 149/mês (2,5 anos, tecnólogo)</li>
<li><a href="/cursos/marketing">Marketing</a> — a partir de R$ 149/mês (2 anos, tecnólogo)</li>
</ul>

<p>Tecnólogos (2-2,5 anos) tendem a ser mais baratos que bacharelados (4 anos), mesmo na modalidade EAD. Compense pela carreira: tecnólogo de TI ganha igual a bacharel em muitas empresas.</p>

<h2>Cuidado com "mais barata"</h2>

<p>Não escolha apenas por preço. Critérios obrigatórios:</p>

<ul>
<li><strong>Reconhecimento MEC do curso</strong> — sem isso, diploma não vale</li>
<li><strong>Nota MEC mínima 3</strong> (preferível 4-5 pra concurso público)</li>
<li><strong>Polo presencial próximo</strong> de você (provas obrigatórias)</li>
<li><strong>Plataforma EAD funcional</strong> — peça demo antes de matricular</li>
<li><strong>Suporte responsivo</strong> — teste contatando o suporte com pergunta simples</li>
</ul>

<h2>Comparativo direto</h2>

<p>Antes de fechar matrícula, <a href="/cursos">compare 2-3 faculdades</a> pra mesmo curso na mesma cidade. Preço cheio, percentual de desconto, custos extras (matrícula, material), nota MEC e localização do polo são variáveis decisivas.</p>

<p>Pra ver mensalidades EAD com bolsa em tempo real por curso e cidade, <a href="/faculdade-ead">acesse o hub de Faculdade EAD do Bolsa Click</a>.</p>`,
}

const POST_PEDAGOGIA_EAD = {
  slug: 'curso-de-pedagogia-ead',
  title: 'Curso de Pedagogia EAD: reconhecimento MEC, mensalidade e mercado em 2026',
  excerpt:
    'Pedagogia EAD tem o mesmo valor do presencial? Habilita pra concurso? Quanto custa? Guia completo da licenciatura mais procurada do Brasil, com bolsa Bolsa Click.',
  metaTitle: 'Curso de Pedagogia EAD 2026: Mensalidade, MEC e Mercado | Bolsa Click',
  metaDescription:
    'Pedagogia EAD com bolsa Bolsa Click a partir de R$ 99/mês. Reconhecimento MEC pleno, habilita concurso. Tudo sobre o curso em 4 anos.',
  keywords: [
    'curso de pedagogia ead',
    'pedagogia ead',
    'pedagogia ead reconhecida mec',
    'mensalidade pedagogia ead',
    'pedagogia a distância',
  ],
  tags: ['pedagogia', 'ead', 'licenciatura'],
  readingTime: 5,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['pedagogia', 'ead'],
  content: `<p>Pedagogia EAD é uma das licenciaturas mais procuradas do Brasil — combina baixa mensalidade, alta empregabilidade em redes públicas e privadas, e flexibilidade pra quem trabalha ou cuida de família. Esse guia responde as 6 perguntas mais comuns sobre o curso.</p>

<h2>Pedagogia EAD é reconhecida pelo MEC?</h2>

<p><strong>Sim, totalmente.</strong> Pedagogia em modalidade EAD tem reconhecimento pleno do MEC desde 2005, regulamentada pela Portaria 1.428/2018. O diploma EAD <strong>tem exatamente o mesmo valor legal e profissional do presencial</strong> — pra concurso público, contratação em rede privada e pós-graduação. Empresas e órgãos não distinguem modalidade na contratação.</p>

<p>Sempre confirme no portal e-MEC se a faculdade que você quer cursar tem reconhecimento ativo pro curso de Pedagogia EAD — algumas instituições oferecem sem autorização.</p>

<h2>Pedagogia EAD habilita pra dar aula?</h2>

<p>Sim. A graduação em Pedagogia (EAD ou presencial) <strong>habilita pra Educação Infantil, Anos Iniciais do Ensino Fundamental, gestão escolar e coordenação pedagógica</strong>. Você pode atuar em escolas públicas (via concurso) ou privadas, em creches, em pré-escolas e em coordenação educacional.</p>

<p>Pra dar aula nos Anos Finais do Fundamental ou Médio, é preciso outra licenciatura específica (Letras, Matemática, História, etc).</p>

<h2>Quanto tempo dura Pedagogia EAD?</h2>

<p>Pedagogia tem duração padrão de <strong>4 anos (8 semestres)</strong>, com carga horária mínima de 3.200 horas, incluindo 400 horas de estágio supervisionado em escolas. Algumas faculdades oferecem formato intensivo de 3,5 anos. EAD ou presencial tem a mesma duração — é uma exigência do MEC.</p>

<h2>Quanto custa Pedagogia EAD?</h2>

<p>Em faculdades particulares parceiras do Bolsa Click (Anhanguera, Unopar, Ampli, Pitágoras), Pedagogia EAD em 2026:</p>

<ul>
<li><strong>Sem bolsa:</strong> mensalidade cheia R$ 400 a R$ 800/mês</li>
<li><strong>Com bolsa Bolsa Click:</strong> a partir de R$ 99/mês (descontos de até 80%)</li>
</ul>

<p>Em 4 anos com bolsa: investimento total entre R$ 4.800 e R$ 12.000. Uma das graduações mais acessíveis do país.</p>

<h2>Como funciona a Pedagogia EAD na prática</h2>

<ol>
<li><strong>Videoaulas gravadas</strong> — você assiste no horário que quiser na plataforma online</li>
<li><strong>Atividades semanais</strong> — fóruns, exercícios, leituras programadas</li>
<li><strong>Tutoria online</strong> — professores tira-dúvidas via chat ou e-mail</li>
<li><strong>Provas presenciais</strong> — no polo da faculdade mais próximo (1x por bimestre)</li>
<li><strong>Estágio obrigatório</strong> — 400h em escolas conveniadas ou próximas de você</li>
</ol>

<h2>Mercado de trabalho de Pedagogia</h2>

<p>O piso nacional do magistério em 2024 é R$ 4.580 (40h/semana, jornada plena), reajustado anualmente. Salários iniciais variam por rede:</p>

<ul>
<li>Redes municipais menores: R$ 2.500-R$ 3.800</li>
<li>Capitais e estados grandes: R$ 4.000-R$ 6.000</li>
<li>Redes privadas premium (escolas bilíngues, internacionais): R$ 5.500-R$ 9.000</li>
<li>Coordenadores pedagógicos e diretores: R$ 8.000-R$ 12.000</li>
</ul>

<p>Crescimento de carreira via pós-graduação (Psicopedagogia, Gestão Escolar, Educação Especial) ou via concurso pra magistério público.</p>

<h2>Próximo passo</h2>

<p>Pra ver mensalidades reais de Pedagogia EAD com bolsa hoje, <a href="/cursos/pedagogia">acesse a página de Pedagogia no Bolsa Click</a>. Veja também outras opções no nosso <a href="/faculdade-ead">hub de Faculdade EAD</a>.</p>`,
}

const POST_ENFERMAGEM_ANHANGUERA = {
  slug: 'bolsa-de-enfermagem-anhanguera',
  title: 'Bolsa de Enfermagem na Anhanguera 2026: como conseguir até 80% de desconto',
  excerpt:
    'A Anhanguera tem mais de 200 polos pelo Brasil ofertando Enfermagem com bolsa de até 80% pelo Bolsa Click. Veja mensalidade, reconhecimento MEC e processo de matrícula.',
  metaTitle: 'Bolsa de Enfermagem na Anhanguera 2026: a partir de R$ 299 | Bolsa Click',
  metaDescription:
    'Enfermagem na Anhanguera com bolsa Bolsa Click a partir de R$ 299/mês. Reconhecimento MEC. Mais de 200 polos no Brasil. Sem ENEM, cadastro grátis.',
  keywords: [
    'bolsa de enfermagem anhanguera',
    'enfermagem anhanguera',
    'mensalidade enfermagem anhanguera',
    'enfermagem com bolsa',
    'desconto enfermagem',
  ],
  tags: ['enfermagem', 'anhanguera', 'bolsa-de-estudo'],
  readingTime: 4,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['anhanguera', 'bolsas-de-estudo'],
  content: `<p>A Universidade Anhanguera é uma das maiores redes de ensino superior privado do Brasil, com mais de 200 polos em todas as regiões. O curso de Enfermagem na Anhanguera tem <strong>reconhecimento pleno do MEC</strong> e, com bolsa pelo Bolsa Click, mensalidades começam <strong>a partir de R$ 299/mês</strong>. Esse guia explica como conseguir.</p>

<h2>Enfermagem na Anhanguera: o curso</h2>

<p>O Bacharelado em Enfermagem da Anhanguera tem duração de <strong>5 anos (10 semestres)</strong>, com carga horária mínima de 4.000 horas, incluindo 800 horas de estágio obrigatório em hospitais, UBS e ambulatórios conveniados.</p>

<p>A Anhanguera oferece Enfermagem em modalidade <strong>presencial e semipresencial</strong> (com parte das aulas teóricas online + práticas presenciais obrigatórias). Não existe Enfermagem 100% EAD na Anhanguera nem em qualquer faculdade — o COFEN e o MEC proíbem.</p>

<h2>Quanto custa Enfermagem na Anhanguera?</h2>

<p>Em 2026, valores praticados:</p>

<ul>
<li><strong>Mensalidade cheia (sem bolsa):</strong> R$ 1.200 a R$ 1.800/mês conforme cidade</li>
<li><strong>Com bolsa Bolsa Click:</strong> a partir de R$ 299/mês (desconto de até 80%)</li>
</ul>

<p>Em 5 anos com bolsa: investimento total entre R$ 18.000 e R$ 24.000. Em valor cheio: R$ 72.000 a R$ 108.000. Economia: até R$ 90 mil.</p>

<h2>Reconhecimento MEC</h2>

<p>O curso de Enfermagem da Anhanguera tem reconhecimento ativo do MEC com nota <strong>3 na avaliação institucional</strong>. O registro profissional no COREN é automático após formado e ENADE realizado.</p>

<p>Anhanguera é credenciada pra emitir diploma de graduação reconhecido em todo território nacional. Verifique no portal e-MEC se o curso na sua cidade específica tem reconhecimento — algumas unidades novas podem estar em processo de avaliação.</p>

<h2>Como conseguir bolsa pelo Bolsa Click</h2>

<p>O processo é simples:</p>

<ol>
<li>Acesse a <a href="/cursos/enfermagem">página de Enfermagem no Bolsa Click</a> e filtre por Anhanguera + sua cidade</li>
<li>Cadastre-se grátis (sem ENEM, sem CPF de parente, sem comprovação de renda)</li>
<li>Garanta a bolsa antes da matrícula direto pelo site</li>
<li>Faça o processo seletivo da Anhanguera (geralmente redação online)</li>
<li>Conclua matrícula com a Anhanguera já com o desconto aplicado</li>
</ol>

<h2>Alternativas se sua cidade não tem Anhanguera</h2>

<p>Se Anhanguera não tem polo próximo de você, outras opções com bolsa Bolsa Click:</p>

<ul>
<li><strong>Unopar</strong> — rede irmã (mesmo grupo Cogna), forte no Sul e Sudeste</li>
<li><strong>Pitágoras</strong> — grande presença em Minas Gerais e Bahia</li>
<li><strong>Unime</strong> — concentrada na Bahia e Nordeste</li>
</ul>

<p>Todas oferecem Enfermagem com bolsa pelo Bolsa Click. Veja todas as <a href="/bolsas/saude">bolsas em faculdades de saúde</a> ou explore especificamente a <a href="/faculdades/anhanguera">página da Anhanguera no Bolsa Click</a>.</p>`,
}

const POST_ADM_EAD = {
  slug: 'bolsa-de-administracao-ead',
  title: 'Bolsa de Administração EAD: a partir de R$ 99/mês em 2026',
  excerpt:
    'Administração é a graduação EAD mais procurada do Brasil. Com bolsa pelo Bolsa Click, mensalidades começam em R$ 99/mês em Anhanguera, Unopar e outras. Guia completo.',
  metaTitle: 'Bolsa de Administração EAD 2026: a partir de R$ 99 | Bolsa Click',
  metaDescription:
    'Administração EAD com bolsa Bolsa Click a partir de R$ 99/mês. Reconhecimento MEC pleno, 4 anos, diploma igual ao presencial. Sem ENEM, inscrição grátis.',
  keywords: [
    'bolsa de administracao ead',
    'administracao ead',
    'mensalidade administracao ead',
    'faculdade de administracao ead',
    'curso administracao distancia',
  ],
  tags: ['administracao', 'ead', 'bolsa-de-estudo'],
  readingTime: 5,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['ead', 'graduacao'],
  content: `<p>Administração é a graduação mais matriculada no Brasil — e em modalidade EAD é uma das opções mais acessíveis em termos de preço. Com bolsa pelo Bolsa Click, mensalidades começam <strong>a partir de R$ 99/mês</strong> em faculdades parceiras como Anhanguera, Unopar, Ampli e Pitágoras.</p>

<h2>Administração EAD vale a pena?</h2>

<p>Sim, com critérios. Administração tem cobertura de mercado ampla (todas as empresas têm áreas administrativas) e o diploma EAD <strong>tem exatamente o mesmo valor legal e profissional do presencial</strong>. O CRA aceita registro de administradores formados em EAD reconhecido pelo MEC sem distinção.</p>

<p>Empresas privadas raramente perguntam modalidade do curso na contratação — o que pesa é a faculdade (Anhanguera vs USP é diferença real), seu currículo, experiência e network.</p>

<h2>Quanto custa Administração EAD com bolsa?</h2>

<ul>
<li><strong>Sem bolsa:</strong> mensalidade cheia R$ 350 a R$ 700/mês</li>
<li><strong>Com bolsa Bolsa Click:</strong> a partir de R$ 99/mês (até 80% off)</li>
</ul>

<p>O curso dura 4 anos (8 semestres). Investimento total com bolsa: R$ 4.752 a R$ 12.000. Uma das graduações mais baratas do país em modalidade EAD.</p>

<h2>O que você estuda em Administração EAD</h2>

<p>Grade curricular típica inclui: Teoria Geral da Administração, Contabilidade, Economia, Matemática Financeira, Gestão de Pessoas, Marketing, Logística e Operações, Empreendedorismo, Planejamento Estratégico, e Gestão Financeira.</p>

<p>O TCC final pode ser um plano de negócio, análise de empresa real ou pesquisa acadêmica — opção mais flexível que em cursos clássicos.</p>

<h2>Mercado de trabalho de administrador</h2>

<p>Segundo o CAGED 2024, o salário médio de administradores no Brasil é R$ 4.200. Trajetória típica:</p>

<ul>
<li>Recém-formado / trainee: R$ 2.500-R$ 3.500</li>
<li>Pleno: R$ 5.000-R$ 8.000</li>
<li>Sênior (com 5+ anos): R$ 9.000-R$ 14.000</li>
<li>Gerência / diretoria em médio/grande porte: R$ 15.000-R$ 30.000+</li>
</ul>

<p>MBA e especializações em áreas como Finanças, Marketing Digital, RH ou Supply Chain aceleram crescimento. Inglês fluente também é diferencial.</p>

<h2>Como conseguir</h2>

<p>Pra ver as ofertas reais de Administração EAD com bolsa hoje, <a href="/cursos/administracao">acesse a página de Administração no Bolsa Click</a>. Veja também outras opções no nosso <a href="/faculdade-ead">hub de Faculdade EAD</a> e o <a href="/como-conseguir-bolsa-de-estudo">guia completo de bolsa de estudo</a>.</p>`,
}

const POST_FACULDADE_EAD_ANHANGUERA = {
  slug: 'faculdade-ead-anhanguera',
  title: 'Faculdade EAD Anhanguera 2026: cursos, mensalidade e polos próximos',
  excerpt:
    'A Anhanguera EAD tem mais de 1.500 polos e mensalidades a partir de R$ 99/mês com bolsa Bolsa Click. Guia completo dos cursos, processo e diferenciais da maior rede EAD do Brasil.',
  metaTitle: 'Faculdade EAD Anhanguera 2026 | Mensalidade a partir de R$ 99',
  metaDescription:
    'Anhanguera EAD: 1.500+ polos, cursos reconhecidos MEC, bolsa de até 80% pelo Bolsa Click. Administração, Pedagogia, ADS, Engenharias e mais a partir de R$ 99/mês.',
  keywords: [
    'faculdade ead anhanguera',
    'anhanguera ead',
    'mensalidade anhanguera ead',
    'cursos ead anhanguera',
    'anhanguera distancia',
  ],
  tags: ['anhanguera', 'ead', 'graduacao'],
  readingTime: 4,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['anhanguera', 'ead'],
  content: `<p>A Universidade Anhanguera é a maior rede de ensino superior privado em modalidade EAD no Brasil, com mais de <strong>1.500 polos presenciais</strong> em todos os 26 estados + DF. Combinada com bolsas do Bolsa Click, oferece graduações a partir de <strong>R$ 99/mês</strong>.</p>

<h2>Por que escolher Anhanguera EAD</h2>

<ul>
<li><strong>Maior rede de polos do Brasil</strong> — você encontra polo presencial em quase qualquer cidade média</li>
<li><strong>Mais de 100 cursos reconhecidos MEC</strong> em modalidade EAD ou semipresencial</li>
<li><strong>Plataforma EAD madura</strong> (Aulas+ ou Sava) com aulas gravadas + tutoria 24/7</li>
<li><strong>Diploma reconhecido</strong> idêntico ao presencial pra todas as finalidades</li>
<li><strong>Bolsa Click negociada</strong> com descontos de até 80% sobre valor cheio</li>
</ul>

<h2>Cursos EAD na Anhanguera com bolsa Bolsa Click</h2>

<p>Principais cursos disponíveis em modalidade EAD reconhecida:</p>

<ul>
<li><a href="/cursos/administracao">Administração</a> — bacharelado 4 anos, a partir de R$ 99/mês</li>
<li><a href="/cursos/pedagogia">Pedagogia</a> — licenciatura 4 anos, a partir de R$ 99/mês</li>
<li><a href="/cursos/analise-e-desenvolvimento-de-sistemas">ADS</a> — tecnólogo 2,5 anos, a partir de R$ 149/mês</li>
<li><a href="/cursos/engenharia-civil">Engenharia Civil</a> — bacharelado 5 anos EAD (autorizada 2023), a partir de R$ 399/mês</li>
<li><a href="/cursos/educacao-fisica">Educação Física Licenciatura</a> — 4 anos semipresencial, a partir de R$ 199/mês</li>
<li><a href="/cursos/gestao-de-recursos-humanos">Gestão de RH</a> — tecnólogo 2 anos, a partir de R$ 119/mês</li>
<li><a href="/cursos/marketing">Marketing</a> — tecnólogo 2 anos, a partir de R$ 149/mês</li>
<li><a href="/cursos/ciencias-contabeis">Ciências Contábeis</a> — bacharelado 4 anos, a partir de R$ 149/mês</li>
</ul>

<h2>Como funciona Anhanguera EAD</h2>

<ol>
<li><strong>Aulas online gravadas</strong> — você assiste no horário que quiser na plataforma</li>
<li><strong>Atividades semanais</strong> — fóruns, exercícios, leituras</li>
<li><strong>Tutoria online</strong> — chat e e-mail com professores</li>
<li><strong>Provas presenciais no polo</strong> — 1x por bimestre na unidade Anhanguera mais próxima</li>
<li><strong>Estágios</strong> — em empresas conveniadas ou que você indicar (regulamentação MEC obrigatória pros cursos que exigem)</li>
</ol>

<h2>Onde tem polo Anhanguera</h2>

<p>Mais de 1.500 polos em todo Brasil. Capitais têm múltiplos polos (SP tem 30+, RJ 15+, BH 10+). Cidades médias e interior costumam ter pelo menos 1 polo Anhanguera. Pra ver polo exato perto da sua cidade, <a href="/faculdades/anhanguera">acesse a página da Anhanguera no Bolsa Click</a>.</p>

<h2>Próximo passo</h2>

<p>Pra comparar cursos Anhanguera EAD com bolsa em tempo real, <a href="/faculdade-ead">acesse o hub Faculdade EAD do Bolsa Click</a>. Cadastro grátis, sem ENEM, sem CPF de parente.</p>`,
}

const POST_QUANTO_CUSTA = {
  slug: 'quanto-custa-uma-faculdade-particular',
  title: 'Quanto custa uma faculdade particular no Brasil? Valores 2026 por curso',
  excerpt:
    'Faculdade particular no Brasil custa de R$ 400 a R$ 6.500/mês conforme curso e cidade. Veja preços médios por área, modalidade e como economizar até 80% com bolsa.',
  metaTitle: 'Quanto Custa uma Faculdade Particular em 2026 | Valores por Curso',
  metaDescription:
    'Mensalidade de faculdade particular no Brasil: R$ 400 (EAD) a R$ 6.500/mês (Medicina). Veja preços por curso, modalidade e cidade. Como reduzir até 80% com bolsa Bolsa Click.',
  keywords: [
    'quanto custa faculdade particular',
    'valor mensalidade faculdade',
    'preço faculdade particular',
    'mensalidade faculdade brasil',
    'quanto custa uma faculdade',
  ],
  tags: ['mensalidade', 'bolsa-de-estudo', 'graduacao'],
  readingTime: 6,
  author: 'Equipe Bolsa Click',
  featured: false,
  categories: ['bolsas-de-estudo', 'graduacao'],
  content: `<p>A pergunta "quanto custa uma faculdade particular?" não tem uma resposta única. No Brasil, mensalidades variam de <strong>R$ 99/mês (EAD com bolsa)</strong> a mais de <strong>R$ 6.500/mês (Medicina sem bolsa)</strong>. Esse guia detalha valores reais por curso, modalidade e cidade em 2026.</p>

<h2>Preço médio por área (mensalidade cheia, sem bolsa)</h2>

<ul>
<li><strong>Tecnólogos (2-2,5 anos):</strong> R$ 400 - R$ 1.200/mês</li>
<li><strong>Bacharelados em humanas (Adm, Pedagogia, Letras, História):</strong> R$ 500 - R$ 1.500/mês</li>
<li><strong>Bacharelados em exatas / TI (Eng Software, Ciência Computação):</strong> R$ 800 - R$ 2.500/mês</li>
<li><strong>Engenharias clássicas (Civil, Mecânica, Elétrica):</strong> R$ 1.200 - R$ 2.800/mês</li>
<li><strong>Direito:</strong> R$ 1.500 - R$ 3.500/mês</li>
<li><strong>Saúde (Psicologia, Enfermagem, Fisio, Nutri):</strong> R$ 1.200 - R$ 2.500/mês</li>
<li><strong>Odontologia:</strong> R$ 2.500 - R$ 5.000/mês</li>
<li><strong>Medicina:</strong> R$ 4.500 - R$ 12.000/mês</li>
</ul>

<h2>Diferença EAD vs presencial</h2>

<p>Cursos em modalidade EAD reconhecida pelo MEC costumam ser <strong>30-50% mais baratos</strong> que o equivalente presencial. Administração presencial pode sair R$ 800/mês; EAD na mesma faculdade fica R$ 350-500.</p>

<p>Cursos da área de saúde, Direito, Medicina e Odontologia <strong>não podem ser 100% EAD</strong> por regulamentação — proibição de OAB, CFM, CFP, COFEN, etc. A modalidade semipresencial existe pra alguns (Psicologia, Enfermagem) com economia menor (~20%).</p>

<h2>Diferença por cidade</h2>

<p>Mesma faculdade, mesmo curso, cidade diferente — diferença de preço chega a 40%:</p>

<ul>
<li><strong>Capitais SP/RJ:</strong> mais caro (até 40% acima da média nacional)</li>
<li><strong>Capitais médias (BH, POA, Curitiba, Salvador):</strong> média</li>
<li><strong>Cidades de polo regional:</strong> mais barato (até 30% abaixo)</li>
</ul>

<h2>Como reduzir custos</h2>

<h3>1. Bolsa Click — até 80% de desconto</h3>
<p>Cadastro grátis, sem ENEM. Negocia descontos com Anhanguera, Unopar, Pitágoras, Unime, Ampli. Aplica-se a qualquer curso e cidade que essas redes ofertam.</p>

<h3>2. ProUni — bolsa integral pra baixa renda</h3>
<p>Famílias com renda per capita até 1,5 salário mínimo + ENEM ≥ 450 = mensalidade 0. Editais 2x por ano.</p>

<h3>3. FIES — financiamento estudantil</h3>
<p>Paga após formado, juros baixos. Requisitos similares ao ProUni.</p>

<h3>4. Bolsa filantrópica em confessionais</h3>
<p>PUC, Mackenzie, Metodista têm programas próprios pra baixa renda — 25% a 100% de desconto.</p>

<h3>5. Modalidade EAD</h3>
<p>Reduz 30-50% sobre o presencial. Combinado com Bolsa Click, mensalidade pode cair pra R$ 99 em alguns cursos.</p>

<h2>Custos extras (sempre presentes)</h2>

<p>Mensalidade não é o único gasto. Sempre considere:</p>

<ul>
<li><strong>Matrícula inicial</strong> — R$ 100-R$ 500 (uma vez)</li>
<li><strong>Material didático</strong> — R$ 200-R$ 800/semestre</li>
<li><strong>Taxa de estágio supervisionado</strong> (saúde, engenharias) — variável</li>
<li><strong>TCC e colação de grau</strong> — R$ 200-R$ 1.000 no último ano</li>
<li><strong>Atividades complementares</strong> — variável</li>
</ul>

<p>Pra um bacharelado de 4 anos, custos extras totalizam tipicamente R$ 5.000-R$ 15.000 ao longo do curso, além da mensalidade.</p>

<h2>Compare valores reais hoje</h2>

<p>Pra ver preços reais com bolsa em tempo real por curso e cidade, <a href="/cursos">acesse o catálogo do Bolsa Click</a>. Veja também nosso <a href="/como-conseguir-bolsa-de-estudo">guia completo de como conseguir bolsa</a> ou explore o <a href="/faculdade-ead">hub de Faculdade EAD</a> pras opções mais acessíveis.</p>`,
}

async function main() {
  await upsertPost(POST_SEM_PROUNI)
  await upsertPost(POST_MENSALIDADE_PSI)
  await upsertPost(POST_EAD_TRABALHO)
  await upsertPost(POST_DIREITO_MENSALIDADE)
  await upsertPost(POST_EAD_BARATA)
  await upsertPost(POST_PEDAGOGIA_EAD)
  await upsertPost(POST_ENFERMAGEM_ANHANGUERA)
  await upsertPost(POST_ADM_EAD)
  await upsertPost(POST_FACULDADE_EAD_ANHANGUERA)
  await upsertPost(POST_QUANTO_CUSTA)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
