// Popula coreSubjects dos 10 cursos top no FeaturedCourse.
// Run: node scripts/seed-core-subjects.mjs
// Pré-req: npx prisma migrate deploy (executa a migration 20260518000000_add_core_subjects)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CORE_SUBJECTS = {
  psicologia: [
    'Introdução à Psicologia',
    'Psicologia do Desenvolvimento',
    'Psicopatologia',
    'Psicologia Social',
    'Neuropsicologia',
    'Teorias da Personalidade',
    'Psicodiagnóstico',
    'Ética Profissional',
    'Estágio Supervisionado em Psicologia Clínica',
  ],

  direito: [
    'Direito Constitucional',
    'Direito Civil',
    'Direito Penal',
    'Direito Processual Civil',
    'Direito Processual Penal',
    'Direito Empresarial',
    'Direito do Trabalho',
    'Direito Administrativo',
    'Filosofia do Direito',
    'Prática Jurídica (estágio)',
  ],

  enfermagem: [
    'Anatomia Humana',
    'Fisiologia',
    'Microbiologia e Parasitologia',
    'Fundamentos de Enfermagem',
    'Enfermagem em Saúde Coletiva',
    'Enfermagem Médico-Cirúrgica',
    'Enfermagem Pediátrica',
    'Enfermagem Obstétrica',
    'Administração em Enfermagem',
    'Estágio Supervisionado em Hospital',
  ],

  administracao: [
    'Teoria Geral da Administração',
    'Contabilidade Geral',
    'Economia',
    'Matemática Financeira',
    'Gestão de Pessoas',
    'Marketing',
    'Gestão Financeira',
    'Logística e Operações',
    'Empreendedorismo',
    'Planejamento Estratégico',
  ],

  pedagogia: [
    'História da Educação',
    'Psicologia da Educação',
    'Didática',
    'Currículo e Práticas Pedagógicas',
    'Alfabetização e Letramento',
    'Educação Infantil',
    'Gestão Escolar',
    'Avaliação da Aprendizagem',
    'Educação Inclusiva',
    'Estágio Supervisionado em Escolas',
  ],

  'educacao-fisica': [
    'Anatomia e Biomecânica',
    'Fisiologia do Exercício',
    'Cinesiologia',
    'Pedagogia do Esporte',
    'Treinamento Esportivo',
    'Ginástica e Atividades Rítmicas',
    'Natação e Esportes Aquáticos',
    'Lutas e Esportes de Combate',
    'Educação Física Escolar',
    'Saúde Coletiva e Atividade Física',
  ],

  'engenharia-civil': [
    'Cálculo e Geometria Analítica',
    'Mecânica dos Sólidos',
    'Resistência dos Materiais',
    'Materiais de Construção',
    'Hidráulica e Hidrologia',
    'Geotecnia e Mecânica dos Solos',
    'Estruturas de Concreto Armado',
    'Estruturas Metálicas e Madeira',
    'Topografia',
    'Planejamento e Gestão de Obras',
  ],

  fisioterapia: [
    'Anatomia Humana',
    'Fisiologia',
    'Cinesiologia',
    'Cinesioterapia',
    'Eletroterapia',
    'Fisioterapia Ortopédica e Traumatológica',
    'Fisioterapia Neurofuncional',
    'Fisioterapia Cardiorrespiratória',
    'Fisioterapia em Pediatria e Geriatria',
    'Estágio Supervisionado em Clínica',
  ],

  nutricao: [
    'Bioquímica da Nutrição',
    'Avaliação Nutricional',
    'Dietética',
    'Microbiologia e Higiene dos Alimentos',
    'Nutrição Clínica',
    'Nutrição Materno-Infantil',
    'Nutrição em Saúde Coletiva',
    'Gestão de Unidades de Alimentação (UAN)',
    'Nutrição Esportiva',
    'Estágio Supervisionado',
  ],

  'analise-e-desenvolvimento-de-sistemas': [
    'Lógica de Programação',
    'Algoritmos e Estruturas de Dados',
    'Banco de Dados',
    'Programação Orientada a Objetos',
    'Desenvolvimento Web (HTML/CSS/JS)',
    'Desenvolvimento Mobile',
    'Engenharia de Software',
    'Redes de Computadores',
    'Segurança da Informação',
    'Projeto Integrador',
  ],
}

async function main() {
  let updated = 0
  let notFound = 0

  for (const [slug, subjects] of Object.entries(CORE_SUBJECTS)) {
    const result = await prisma.featuredCourse.updateMany({
      where: { slug },
      data: { coreSubjects: subjects },
    })
    if (result.count > 0) {
      console.log(`✅ ${slug}: ${subjects.length} disciplinas`)
      updated += result.count
    } else {
      console.log(`⚠️  ${slug}: curso não encontrado no DB (skip)`)
      notFound++
    }
  }

  console.log(`\nResumo: ${updated} atualizados | ${notFound} não encontrados`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
