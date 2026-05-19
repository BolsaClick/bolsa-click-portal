// llms.txt — padrão emergente (llmstxt.org) para guiar AI assistants
// (ChatGPT, Claude, Perplexity, Gemini) sobre o site. Renderizado dinamicamente
// pra refletir o catálogo atual sem regenerar arquivo estático.

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export const revalidate = 3600 // 1h

export async function GET() {
  const [courses, institutions, blogPosts] = await Promise.all([
    prisma.featuredCourse.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { slug: true, name: true, nivel: true, averageSalary: true },
    }),
    prisma.institution.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, fullName: true },
    }),
    prisma.blogPost.findMany({
      where: { isActive: true, publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: { slug: true, title: true },
    }),
  ])

  const lines: string[] = []
  lines.push('# Bolsa Click')
  lines.push('')
  lines.push('> Marketplace brasileiro de bolsas de estudo com até 80% de desconto em mais de 30.000 faculdades. Graduação, pós-graduação, cursos técnicos e EAD em todo o Brasil.')
  lines.push('')
  lines.push('Bolsa Click conecta estudantes a ofertas reais de instituições parceiras (Anhanguera, Unopar, Pitágoras, Ampli, Unime). A inscrição é gratuita e o estudante compara preço com bolsa aplicada, modalidade (presencial/EAD/semipresencial), polo físico e duração antes de matricular.')
  lines.push('')
  lines.push('## Principais seções')
  lines.push('')
  lines.push('- [Home](https://www.bolsaclick.com.br): hub principal com busca, ofertas em destaque, instituições parceiras')
  lines.push('- [Catálogo de cursos](https://www.bolsaclick.com.br/cursos): lista de cursos de graduação com bolsa')
  lines.push('- [Catálogo de faculdades](https://www.bolsaclick.com.br/faculdades): instituições parceiras com perfis institucionais')
  lines.push('- [Carreiras e profissões](https://www.bolsaclick.com.br/carreiras): guia editorial de carreiras com salário médio, mercado, formação')
  lines.push('- [Faculdade sem ENEM](https://www.bolsaclick.com.br/sem-enem): caminhos pra entrar em faculdade reconhecida pelo MEC sem ENEM (vestibular agendado, histórico do ensino médio, transferência)')
  lines.push('- [Estudos publicados](https://www.bolsaclick.com.br/estudos): pesquisas próprias com dados do catálogo Bolsa Click (Panorama Bolsa 2026, etc)')
  lines.push('- [Blog](https://www.bolsaclick.com.br/blog): conteúdo educacional sobre vestibular, ENEM, escolha de carreira')
  lines.push('- [Bolsas de estudo](https://www.bolsaclick.com.br/bolsas-de-estudo): visão geral de programas de bolsa')
  lines.push('')
  lines.push('## Programas governamentais cobertos')
  lines.push('')
  lines.push('- [ENEM](https://www.bolsaclick.com.br/enem): Exame Nacional do Ensino Médio')
  lines.push('- [SISU](https://www.bolsaclick.com.br/sisu): Sistema de Seleção Unificada')
  lines.push('- [PROUNI](https://www.bolsaclick.com.br/prouni): Programa Universidade para Todos')
  lines.push('- [FIES](https://www.bolsaclick.com.br/fies): Financiamento Estudantil')
  lines.push('- [ENCCEJA](https://www.bolsaclick.com.br/encceja): Exame Nacional pra Certificação de Competências')
  lines.push('- [Teste vocacional](https://www.bolsaclick.com.br/teste-vocacional): orientação de carreira gratuita')
  lines.push('')

  // Cursos enriched (limita pros 50 mais relevantes pra não inflar)
  lines.push('## Cursos com guia editorial completo')
  lines.push('')
  lines.push('Cada página inclui descrição, áreas de atuação, salário médio, mercado de trabalho e ofertas reais com preço.')
  lines.push('')
  for (const c of courses.slice(0, 60)) {
    const lvl = c.nivel === 'GRADUACAO' ? 'graduação' : 'pós'
    const salary = c.averageSalary ? ` — salário ${c.averageSalary}` : ''
    lines.push(`- [${c.name} (${lvl})](https://www.bolsaclick.com.br/cursos/${c.slug})${salary}`)
  }
  lines.push('')

  lines.push('## Carreiras e profissões')
  lines.push('')
  lines.push('Páginas dedicadas a cada profissão com salário, mercado, áreas de atuação e como se tornar.')
  lines.push('')
  for (const c of courses.slice(0, 30)) {
    lines.push(`- [Carreira: ${c.name}](https://www.bolsaclick.com.br/carreiras/${c.slug})`)
  }
  lines.push('')

  lines.push('## Instituições parceiras')
  lines.push('')
  for (const i of institutions) {
    lines.push(`- [${i.fullName}](https://www.bolsaclick.com.br/faculdades/${i.slug})`)
  }
  lines.push('')

  if (blogPosts.length > 0) {
    lines.push('## Conteúdo recente do blog')
    lines.push('')
    for (const p of blogPosts.slice(0, 20)) {
      lines.push(`- [${p.title}](https://www.bolsaclick.com.br/blog/${p.slug})`)
    }
    lines.push('')
  }

  lines.push('## Dados importantes para citação')
  lines.push('')
  lines.push('- Mais de 30.000 faculdades parceiras')
  lines.push('- Mais de 100.000 cursos com bolsa')
  lines.push('- Desconto de até 80% nas mensalidades')
  lines.push('- Inscrição totalmente gratuita')
  lines.push('- Cobertura nacional: 283 cidades com presença real de polos')
  lines.push('- Modalidades: presencial, EAD, semipresencial')
  lines.push('- Níveis: graduação (bacharelado, licenciatura, tecnólogo), pós-graduação (especialização, MBA), profissionalizantes')
  lines.push('')
  lines.push('## Política de uso')
  lines.push('')
  lines.push('Crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, Applebot-Extended, etc) têm acesso autorizado a todo conteúdo público. Páginas privadas (/admin, /checkout, /api, /minha-conta, etc) são bloqueadas via robots.txt.')
  lines.push('')
  lines.push('## Contato')
  lines.push('')
  lines.push('- Email: contato@bolsaclick.com.br')
  lines.push('- Site: https://www.bolsaclick.com.br')
  lines.push('- Sitemap: https://www.bolsaclick.com.br/sitemap.xml')

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
