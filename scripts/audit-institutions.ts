/**
 * Auditoria do cadastro de Institution.
 *
 * O cadastro é manual (prisma/seed-institutions.ts + o CRUD em /admin/faculdades)
 * e sai em página pública: tabela de /comparar/[pair], cards de /bolsas-de-estudo,
 * FAQ de /faculdades/[slug] e JSON-LD de EducationalOrganization. Nada disso tem
 * fonte viva, então o campo envelhece em silêncio — e envelhecer em silêncio num
 * dado que o Google lê como structured data é o pior modo de falha possível.
 *
 * Este script NÃO corrige nada. Ele compara o cadastro com o que o nosso próprio
 * catálogo mediu (InstitutionCityOfferCache, InstitutionMaxDiscountCache) e
 * aponta: campo vazio, número sem fonte, número que contradiz a medição, marca
 * fora do alcance do precompute e linha de cache velha.
 *
 *   npx tsx scripts/audit-institutions.ts
 *   npx tsx scripts/audit-institutions.ts --ci   # exit 1 se houver BLOQUEIO
 *
 * Nota MEC e contagem de polo NÃO são estimáveis daqui: nota vem do e-MEC e
 * polo vem da instituição. O script diz onde falta, nunca preenche.
 */

import { PrismaClient } from '@prisma/client'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'

const prisma = new PrismaClient()
const CI = process.argv.includes('--ci')

/** Dias sem reprocessar que já indicam cidade que o precompute parou de alcançar. */
const STALE_DAYS = 21

/** URL de registro real no e-MEC (tem o hash da IES); a home não identifica ninguém. */
const EMEC_RECORD = /emec\.mec\.gov\.br\/emec\/consulta-cadastro\/detalhamento\//

type Severity = 'BLOQUEIO' | 'ATENCAO' | 'NOTA'

type Finding = { slug: string; severity: Severity; field: string; message: string }

const findings: Finding[] = []
const add = (slug: string, severity: Severity, field: string, message: string) =>
  findings.push({ slug, severity, field, message })

/** Números soltos em texto livre que repetem um campo estruturado. */
function numbersInProse(texts: string[], unit: RegExp): number[] {
  const found: number[] = []
  for (const text of texts) {
    for (const match of text.matchAll(/(\d[\d.]*)\s*\+?\s*([a-zç]+)/gi)) {
      if (!unit.test(match[2])) continue
      const value = Number(match[1].replace(/\./g, ''))
      if (Number.isFinite(value)) found.push(value)
    }
  }
  return found
}

async function main() {
  const institutions = await prisma.institution.findMany({ orderBy: { slug: 'asc' } })
  const cacheRows = await prisma.institutionCityOfferCache.findMany({
    select: { brand: true, offerCount: true, fetchedAt: true },
  })
  const discount = await prisma.institutionMaxDiscountCache.findMany()

  const byBrand = new Map<string, { cities: number; offers: number; oldest: Date; stale: number }>()
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 86_400_000)
  for (const row of cacheRows) {
    const cur = byBrand.get(row.brand) ?? {
      cities: 0,
      offers: 0,
      oldest: row.fetchedAt,
      stale: 0,
    }
    cur.cities += 1
    cur.offers += row.offerCount
    if (row.fetchedAt < cur.oldest) cur.oldest = row.fetchedAt
    if (row.fetchedAt < staleCutoff) cur.stale += 1
    byBrand.set(row.brand, cur)
  }
  const discountByBrand = new Map(discount.map((d) => [d.brand, d]))

  console.log('═'.repeat(78))
  console.log('  Auditoria do cadastro de Institution')
  console.log(`  ${institutions.length} instituições · precompute varre ${BRAZILIAN_CITIES.length} municípios`)
  console.log('═'.repeat(78))

  for (const inst of institutions) {
    const measured = byBrand.get(inst.slug)
    const measuredDiscount = discountByBrand.get(inst.slug)

    console.log(`\n── ${inst.name} (${inst.slug}) ${'─'.repeat(Math.max(0, 52 - inst.name.length - inst.slug.length))}`)
    console.log(
      `   cadastro: polos=${inst.campusCount ?? '—'}  cursos=${inst.coursesOffered ?? '—'}  ` +
        `alunos=${inst.studentCount ?? '—'}  MEC=${inst.mecRating ?? '—'}  fundação=${inst.founded ?? '—'}`,
    )
    console.log(
      `   medido:   cidades=${measured?.cities ?? 0}/${BRAZILIAN_CITIES.length}  ` +
        `ofertas=${measured?.offers ?? 0}  ` +
        `desconto_máx=${measuredDiscount ? `${measuredDiscount.maxDiscountPctRaw}% (n=${measuredDiscount.sampleSize})` : '—'}`,
    )
    console.log(`   atualizado em: ${inst.updatedAt.toISOString().slice(0, 10)}`)

    // ── Campos vazios que saem em página pública ────────────────────────────
    if (inst.mecRating == null) {
      add(inst.slug, 'BLOQUEIO', 'mecRating', 'sem nota MEC — a FAQ de /faculdades e a tabela de /comparar caem pro fallback genérico. Só o e-MEC resolve; não estimar.')
    }
    if (inst.campusCount == null) {
      add(inst.slug, 'ATENCAO', 'campusCount', 'sem contagem de polo — a linha "Polos / Unidades" sai "—" na comparação.')
    }
    if (inst.coursesOffered == null) {
      add(inst.slug, 'ATENCAO', 'coursesOffered', 'sem nº de cursos — some da FAQ de /faculdades/[slug].')
    }
    if (inst.studentCount == null) {
      add(inst.slug, 'NOTA', 'studentCount', 'sem nº de alunos.')
    }
    if (inst.founded == null) {
      add(inst.slug, 'ATENCAO', 'founded', 'sem ano de fundação.')
    }
    if (!inst.headquartersCity) {
      add(inst.slug, 'ATENCAO', 'headquartersCity', 'sem sede — a linha "Sede" sai "—".')
    }
    if (inst.longDescription.length < 800) {
      add(inst.slug, 'NOTA', 'longDescription', `texto institucional curto (${inst.longDescription.length} caracteres; a mediana das outras passa de 1.400).`)
    }

    // ── e-MEC: link tem que ser REGISTRO, não a home do portal ──────────────
    if (!inst.emecLink) {
      add(inst.slug, 'BLOQUEIO', 'emecLink', 'sem link do e-MEC.')
    } else if (!EMEC_RECORD.test(inst.emecLink)) {
      add(inst.slug, 'BLOQUEIO', 'emecLink', `aponta pra ${inst.emecLink} — é a home do e-MEC, não o registro da IES. Não comprova nada e não serve de sameAs.`)
    }

    // ── Cobertura do precompute ─────────────────────────────────────────────
    if (!measured) {
      // O precompute de cidade só varre GRADUACAO. Marca de pós (Mackenzie)
      // não ter linha é o esperado, não um buraco de cobertura.
      const ofertaGraduacao = inst.academicLevels.includes('GRADUACAO')
      const temOferta = measuredDiscount && measuredDiscount.sampleSize > 0
      if (!ofertaGraduacao) {
        add(
          inst.slug,
          'NOTA',
          'InstitutionCityOfferCache',
          `sem linha de cidade, o que é esperado: a marca não tem GRADUACAO e o precompute é GRADUACAO-only. Vale conferir por que o precompute de desconto mediu ${measuredDiscount?.sampleSize ?? 0} ofertas pra ela.`,
        )
      } else {
        add(
          inst.slug,
          temOferta ? 'BLOQUEIO' : 'NOTA',
          'InstitutionCityOfferCache',
          temOferta
            ? `nenhuma linha de cidade, apesar de o precompute de desconto ter medido ${measuredDiscount!.sampleSize} ofertas de graduação. A marca está fora do BRAND_NAME_TO_SLUG de scripts/precompute-institution-city-offers.ts — o inventário dela é invisível pro site.`
            : 'nenhuma linha de cidade e nenhuma oferta medida.',
        )
      }
    } else {
      if (measured.stale > 0) {
        add(
          inst.slug,
          'ATENCAO',
          'InstitutionCityOfferCache',
          `${measured.stale} de ${measured.cities} cidades não são reprocessadas há mais de ${STALE_DAYS} dias (mais antiga: ${measured.oldest.toISOString().slice(0, 10)}), e o precompute roda SEMANAL. O upsert só escreve quando a marca aparece na busca daquela cidade, então cidade que perdeu oferta mantém o número antigo pra sempre.`,
        )
      }
      // Cobertura ínfima num grupo grande é sintoma de viés de paginação, não de
      // ausência de oferta: a busca aberta devolve 50 por cidade e a marca
      // dominante ocupa a página inteira (ver BURIED_COGNA_BRANDS em
      // app/lib/api/get-courses-filter.ts).
      if (measured.cities > 0 && measured.cities < BRAZILIAN_CITIES.length * 0.1) {
        add(
          inst.slug,
          'ATENCAO',
          'InstitutionCityOfferCache',
          `só ${measured.cities} cidades de ${BRAZILIAN_CITIES.length}. Medição provavelmente enviesada pela paginação da busca aberta, não cobertura real — não usar como "cidades cobertas" sem confirmar.`,
        )
      }
      // Cruzamento com o cadastro: o campo diz polo, a medição diz cidade com
      // oferta ativa. São métricas diferentes, e é justamente por isso que uma
      // contradizer a outra indica rótulo errado.
      if (inst.campusCount != null && measured.cities > inst.campusCount) {
        add(
          inst.slug,
          'BLOQUEIO',
          'campusCount',
          `cadastro diz ${inst.campusCount} polos, mas medimos oferta ativa em ${measured.cities} municípios distintos (e o varredor só olha ${BRAZILIAN_CITIES.length}, então ${measured.cities} é PISO). O campo está medindo outra coisa — provavelmente campus presencial — e sai rotulado como "Polos / Unidades".`,
        )
      }
    }

    // ── Número solto em texto livre duplicando campo estruturado ────────────
    const prose = [inst.longDescription, inst.description, ...inst.highlights]
    for (const value of numbersInProse(prose, /polos?|campus|campi|unidades?/i)) {
      if (inst.campusCount != null && value !== inst.campusCount) continue
      add(
        inst.slug,
        'ATENCAO',
        'highlights/longDescription',
        `o número ${value} de polos está escrito à mão no texto além de viver em campusCount. Corrigir o campo não corrige a frase — as duas cópias precisam sair da mesma fonte.`,
      )
      break
    }
  }

  // ── Relatório ─────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(78)}`)
  console.log('  Achados')
  console.log('═'.repeat(78))
  const order: Severity[] = ['BLOQUEIO', 'ATENCAO', 'NOTA']
  for (const severity of order) {
    const list = findings.filter((f) => f.severity === severity)
    if (list.length === 0) continue
    console.log(`\n▸ ${severity} (${list.length})`)
    for (const f of list) console.log(`  [${f.slug}] ${f.field}: ${f.message}`)
  }

  const blocking = findings.filter((f) => f.severity === 'BLOQUEIO').length
  console.log(
    `\nTotal: ${findings.length} achados — ${blocking} bloqueio(s), ` +
      `${findings.filter((f) => f.severity === 'ATENCAO').length} atenção, ` +
      `${findings.filter((f) => f.severity === 'NOTA').length} nota.`,
  )
  if (CI && blocking > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error('auditoria falhou:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
