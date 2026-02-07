/**
 * Atualiza as URLs das imagens dos cursos para o Tigris público
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COURSES = [
  { slug: 'administracao', ext: '.jpg' },
  { slug: 'direito', ext: '.webp' },
  { slug: 'enfermagem', ext: '.jpeg' },
  { slug: 'psicologia', ext: '.jpg' },
  { slug: 'educacao-fisica', ext: '.jpeg' },
  { slug: 'pedagogia', ext: '.jpg' },
  { slug: 'analise-e-desenvolvimento-de-sistemas', ext: '.jpeg' },
  { slug: 'gestao-de-recursos-humanos', ext: '.webp' },
  { slug: 'marketing', ext: '.webp' },
  { slug: 'ciencias-contabeis', ext: '.jpg' },
  { slug: 'arquitetura-e-urbanismo', ext: '.jpg' },
  { slug: 'nutricao', ext: '.jpg' },
  { slug: 'fisioterapia', ext: '.jpg' },
  { slug: 'engenharia-civil', ext: '.jpg' },
  { slug: 'engenharia-de-producao', ext: '.jpg' },
  { slug: 'biomedicina', ext: '.jpeg' },
  { slug: 'odontologia', ext: '.jpg' },
  { slug: 'gestao-comercial', ext: '.jpeg' },
  { slug: 'farmacia', ext: '.jpeg' },
  { slug: 'medicina', ext: '.webp' },
]

async function main() {
  console.log('🚀 Atualizando URLs das imagens para Tigris público...\n')

  let successCount = 0

  for (const course of COURSES) {
    const imageUrl = `https://bolsa-click.fly.storage.tigris.dev/cursos/${course.slug}${course.ext}`
    try {
      await prisma.featuredCourse.update({
        where: { slug: course.slug },
        data: { imageUrl },
      })
      console.log(`✅ ${course.slug} → ${imageUrl}`)
      successCount++
    } catch (error) {
      console.log(`❌ ${course.slug}: ${error instanceof Error ? error.message : 'Erro'}`)
    }
  }

  console.log(`\n✅ ${successCount} cursos atualizados!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
