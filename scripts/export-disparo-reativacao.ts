/**
 * export-disparo-reativacao
 * -------------------------
 * Exporta os leads da base pra um CSV segmentado, com mensagem de WhatsApp
 * personalizada por lead — pronto pra importar no CRM/ferramenta de disparo.
 * Só leitura (não altera nada). Uso: node --env-file=.env tsx scripts/export-disparo-reativacao.ts
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()
const OUT = process.env.OUT ?? 'disparo-reativacao.csv'

const SITE = 'https://www.bolsaclick.com.br'
const UTM = (campaign: string, content: string) =>
  `utm_source=whatsapp&utm_medium=reativacao&utm_campaign=${campaign}&utm_content=${content}`

function firstName(name: string): string {
  let n = (name || '').trim().split(/\s+/)[0] ?? ''
  n = n.replace(/^[^\p{L}]+/u, '').replace(/[^\p{L}]+$/u, '') // tira lixo nas pontas (ex: "Matheus-")
  return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : 'tudo bem'
}
function prettyCourse(slug: string): string {
  return (slug || '')
    .replace(/-/g, ' ')
    .replace(/\b(de|da|do|e)\b/gi, (m) => m.toLowerCase())
    .replace(/\b([a-zà-ú])/g, (m) => m.toUpperCase())
    .trim()
}
// Nome acentuado do catálogo: o slug do tv ("educacao-fisica") é prefixo do slug
// do FeaturedCourse ("educacao-fisica-bacharelado"), que tem o name acentuado.
async function buildCourseNameResolver(): Promise<(slug: string) => string> {
  const cats = await prisma.featuredCourse.findMany({ select: { slug: true, name: true } })
  const bySlug = new Map(cats.map((c) => [c.slug, c.name]))
  return (slug: string): string => {
    if (!slug) return 'o curso que combina com você'
    if (bySlug.has(slug)) return bySlug.get(slug)!
    const pref = cats.find((c) => c.slug.startsWith(`${slug}-`))
    return pref ? pref.name : prettyCourse(slug)
  }
}
function waPhone(phone: string): string {
  const d = (phone || '').replace(/\D/g, '')
  if (!d) return ''
  return d.startsWith('55') ? d : `55${d}`
}
function csvCell(s: string): string {
  return `"${(s ?? '').replace(/"/g, '""')}"`
}

interface ProfileData { profile?: { primary?: { name?: string } } }

async function main() {
  const courseName = await buildCourseNameResolver()
  const leads = await prisma.lead.findMany({
    select: { name: true, phone: true, source: true, courseNames: true, extraData: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Dedup por telefone: 1 mensagem por pessoa. Como leads já vêm em createdAt desc,
  // a primeira ocorrência é a mais recente; seg1 (personalizado) ganha de seg2 se o
  // mesmo número aparecer nos dois segmentos.
  const byPhone = new Map<string, string[]>()
  const counts: Record<string, number> = { 'seg1-teste-vocacional': 0, 'seg2-geral': 0, 'sem-telefone': 0, 'duplicados': 0 }

  for (const l of leads) {
    const phone = waPhone(l.phone)
    if (!phone) { counts['sem-telefone']++; continue }
    const nome = firstName(l.name)

    let row: string[]
    if (l.source === 'teste-vocacional') {
      const perfil = (l.extraData as ProfileData)?.profile?.primary?.name ?? ''
      const topSlug = Array.isArray(l.courseNames) ? l.courseNames[0] : ''
      const curso = courseName(topSlug)
      const link = `${SITE}/simulador-de-bolsa?${UTM('base-jul', 'teste-vocacional')}`
      const msg = perfil
        ? `Oi ${nome}! 👋 Aqui é do Bolsa Click. Você fez nosso teste vocacional e seu perfil deu *${perfil}* — com ${curso} entre os cursos que mais combinam com você. 🎓 Quer ver agora quanto ficaria a mensalidade de ${curso} com bolsa de até 80%, sem nota de corte? É rápido: ${link} — se não quiser mais receber, responda SAIR.`
        : `Oi ${nome}! 👋 Aqui é do Bolsa Click. Você fez nosso teste vocacional e ${curso} apareceu entre os cursos que mais combinam com você. 🎓 Quer ver a mensalidade com bolsa de até 80%? ${link} — se não quiser mais receber, responda SAIR.`
      row = ['seg1-teste-vocacional', nome, phone, perfil, curso, link, msg]
    } else {
      const link = `${SITE}/descubra-sua-bolsa?${UTM('base-jul', 'geral')}`
      const msg = `Oi ${nome}! 👋 Aqui é do Bolsa Click. Vi que você começou a buscar bolsa com a gente. São bolsas de até 80% sem nota de corte, em faculdades reconhecidas pelo MEC. 🎓 Em 2 minutos você descobre a sua: ${link} — se não quiser mais receber, responda SAIR.`
      row = ['seg2-geral', nome, phone, '', '', link, msg]
    }

    const existing = byPhone.get(phone)
    if (!existing) {
      byPhone.set(phone, row)
    } else {
      counts['duplicados']++
      // upgrade seg2 → seg1 (mensagem personalizada vale mais que a genérica)
      if (existing[0] === 'seg2-geral' && row[0] === 'seg1-teste-vocacional') byPhone.set(phone, row)
    }
  }

  const rows = [...byPhone.values()]
  for (const r of rows) counts[r[0]]++

  const header = ['segmento', 'nome', 'telefone_wa', 'perfil', 'curso_top', 'link', 'mensagem']
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
  writeFileSync(OUT, '﻿' + csv, 'utf8') // BOM p/ Excel abrir acentos certo

  console.log('=== export do disparo de reativação ===')
  console.log(`  Segmento 1 (teste vocacional, personalizado): ${counts['seg1-teste-vocacional']}`)
  console.log(`  Segmento 2 (geral):                            ${counts['seg2-geral']}`)
  console.log(`  Sem telefone (pulados):                        ${counts['sem-telefone']}`)
  console.log(`  Duplicados por telefone (dedupados):           ${counts['duplicados']}`)
  console.log(`  TOTAL exportado: ${rows.length}`)
  console.log(`\n  Arquivo: ${OUT}`)
}
main().finally(() => prisma.$disconnect())
