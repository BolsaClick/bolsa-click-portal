#!/usr/bin/env tsx
/**
 * scripts/reconcile-api-course-names.ts
 *
 * Corrige `FeaturedCourse.apiCourseName` de cursos com página de cidade cujo
 * nome não casa com nenhum curso dos parceiros, e tira `hasCityPages` de quem
 * não existe em parceiro nenhum. Dry-run por padrão; `--apply` grava.
 *
 * ORIGEM (2026-10-10, tarefa 7)
 *
 * 51 cursos com `hasCityPages` tinham Cogna = 0 E Athena = 0 nas 160 cidades
 * do cache. Reconciliado SEM chamada à Cogna, contra a tabela `Course` do
 * tartarus-bff (1.144 nomes que a própria Cogna devolveu em /offers/search,
 * última sincronização 24/07) mais `tartarus-bff/scripts/migrate-cursos-
 * profissionalizantes.json`.
 *
 * Calibração da regra: entre os 356 cursos com oferta Cogna no cache, 351
 * (98,6%) têm o `apiCourseName` IGUAL a um nome do catálogo ou PREFIXO dele
 * ("Pedagogia" → "Pedagogia - Licenciatura"). Os 51 não passam nessa regra:
 *
 *  - RENOMEAR: o nome tem prefixo editorial nosso ("Curso Profissionalizante
 *    de", "Especialização em") e o nome real está no catálogo. 14 casos de alta
 *    confiança, com o mesmo assunto e só a redação diferente.
 *  - SEM PARCEIRO: nenhum nome do catálogo com o mesmo assunto e Athena zerada.
 *    `hasCityPages` sai. Isso NÃO desindexa nada: com zero oferta eles já
 *    estavam fora do sitemap (corte de 5) e a página já era noindex (gate ≥ 1).
 *    O efeito é sair da camada 1 da fila do precompute (SLA 7d) para a camada 2
 *    (28d): ~5.400 pares por semana a menos medindo zero. A página nacional
 *    /cursos/[slug] não muda (isActive continua true).
 *  - NOME CERTO, SEM OFERTA: casa com o catálogo, mas tem zero oferta nas 160
 *    cidades (Engenharia de Minas, Mecatrônica Industrial). Mesmo tratamento.
 *    Rever quando a lista de cidades crescer (tarefa 5).
 *
 * Nenhum dos 51 tem oferta Athena, então nenhum vira "só Estácio".
 *
 * Cada linha só é alterada se o valor ATUAL for o esperado: o script é
 * idempotente e não sobrescreve correção manual feita depois.
 *
 * USO:
 *   npx tsx --env-file=.env scripts/reconcile-api-course-names.ts          # dry-run
 *   npx tsx --env-file=.env scripts/reconcile-api-course-names.ts --apply
 */
import { PrismaClient } from '@prisma/client'

const APPLY = process.argv.includes('--apply')

/** [apiCourseName atual, nome no catálogo Cogna] — revisados um a um. */
export const RENAMES: ReadonlyArray<readonly [string, string]> = [
  ['Curso Profissionalizante de Manicure e Pedicure', 'Manicure e Pedicure'],
  ['Curso Profissionalizante de Cuidador de Idosos', 'Cuidador de Idoso'],
  ['Curso Profissionalizante de Cuidador Infantil', 'Cuidador Infantil'],
  ['Curso Profissionalizante de Bartender', 'Bartender'],
  ['Curso Profissionalizante de Confeitaria', 'Confeitaria Profissional'],
  ['Especialização em Direito Penal e Processo Penal', 'Direito Penal e Processo Penal'],
  ['Especialização em Terapia Cognitivo-Comportamental', 'Terapia Cognitivo-Comportamental'],
  ['Especialização em Saúde Pública', 'Saúde Pública'],
  ['Especialização em Direito Tributário', 'Direito Tributário'],
  ['Especialização em Psicologia Clínica', 'Psicologia clínica'],
  ['Especialização em Implantodontia', 'Implantodontia'],
  ['Especialização em Nutrição Esportiva', 'Nutrição esportiva'],
  ['Especialização em Direito de Família e Sucessões', 'Direito de Família e das Sucessões'],
  ['MBA em Data Science e Analytics', 'MBA em Data Science'],
]

/**
 * Sem curso correspondente em parceiro nenhum (ou sem oferta nas 160
 * cidades): `hasCityPages` → false. Identificados pelo apiCourseName atual.
 *
 * Fora desta lista DE PROPÓSITO (decisão do CEO pendente, ver relatório):
 * Especialização em Administração Hospitalar (catálogo só tem "MBA em…"),
 * Eletricista Residencial ("Eletricista: Instalador Predial e Residencial"),
 * Saúde do Trabalho - Enfermagem ("Enfermagem do Trabalho").
 */
export const WITHOUT_PARTNER: ReadonlyArray<string> = [
  'Curso Profissionalizante de Vendedor',
  'Curso Profissionalizante de Eletricista Industrial',
  'Curso Profissionalizante de Soldador',
  'Curso Profissionalizante de Mecânico de Motos',
  'Curso Profissionalizante de Auxiliar de Enfermagem',
  'Curso Profissionalizante de Pintor Predial',
  'Curso Profissionalizante de Pedreiro',
  'Curso Profissionalizante de Acompanhante Hospitalar',
  'Curso Profissionalizante de Auxiliar de Saúde Bucal',
  'Curso Profissionalizante de Auxiliar de Veterinária',
  'Curso Profissionalizante de Maquiagem Profissional',
  'Curso Profissionalizante de Auxiliar de Saúde Mental',
  'Curso Profissionalizante de Cabeleireiro',
  'Curso Profissionalizante de Secretariado',
  'Curso Profissionalizante de Socorrista',
  'Curso Profissionalizante de Auxiliar de Farmácia',
  'Curso Profissionalizante de Mecânico Diesel',
  'Curso Profissionalizante de Almoxarife',
  'Curso Profissionalizante de Massoterapia',
  'Curso Profissionalizante de Recepcionista',
  'Curso Profissionalizante de Mecânico de Automóveis',
  'Curso Profissionalizante de Auxiliar Administrativo',
  'Curso Profissionalizante de Operador de Empilhadeira',
  'Curso Profissionalizante de Padeiro',
  'MBA em Inteligência Artificial Aplicada aos Negócios',
  'Especialização em UTI - Enfermagem',
  'Especialização em Nutrição Clínica Funcional',
  'Especialização em Gestão Pública Municipal',
  'Especialização em Fisioterapia Esportiva',
  'Especialização em Perícia Criminal e Ciências Forenses',
  'Especialização em Coaching e Mentoring',
  'Especialização em Obstetrícia - Enfermagem',
  // Nome certo, zero oferta nas 160 cidades.
  'Engenharia de Minas',
  'Mecatrônica Industrial',
]

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log(`reconcile-api-course-names  ${APPLY ? 'APLICANDO' : 'dry-run (use --apply para gravar)'}\n`)
    let renamed = 0
    let unflagged = 0
    let skipped = 0

    for (const [from, to] of RENAMES) {
      const rows = await prisma.featuredCourse.findMany({
        where: { apiCourseName: from, isActive: true },
        select: { id: true, slug: true },
      })
      if (rows.length === 0) {
        console.log(`  = já não existe "${from}" (corrigido antes?) — pulado`)
        skipped++
        continue
      }
      for (const r of rows) {
        console.log(`  ✎ ${r.slug}: "${from}" → "${to}"`)
        if (APPLY) await prisma.featuredCourse.update({ where: { id: r.id }, data: { apiCourseName: to } })
        renamed++
      }
    }

    for (const name of WITHOUT_PARTNER) {
      const rows = await prisma.featuredCourse.findMany({
        where: { apiCourseName: name, isActive: true, hasCityPages: true },
        select: { id: true, slug: true },
      })
      if (rows.length === 0) {
        console.log(`  = "${name}" já sem hasCityPages ou inexistente — pulado`)
        skipped++
        continue
      }
      for (const r of rows) {
        console.log(`  ⊘ ${r.slug}: hasCityPages true → false`)
        if (APPLY) await prisma.featuredCourse.update({ where: { id: r.id }, data: { hasCityPages: false } })
        unflagged++
      }
    }

    console.log(
      `\n${APPLY ? 'Gravado' : 'Seria gravado'}: ${renamed} renomeados, ${unflagged} sem hasCityPages, ${skipped} pulados.`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
}
