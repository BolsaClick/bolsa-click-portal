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

async function main() {
  await upsertPost(POST_SEM_PROUNI)
  await upsertPost(POST_MENSALIDADE_PSI)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
