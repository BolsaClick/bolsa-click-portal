/**
 * Script para reverter as URLs das imagens dos cursos para /public
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE_URLS: Record<string, string> = {
  'administracao': '/assets/images/adm.jpg',
  'direito': '/assets/images/direito.webp',
  'enfermagem': '/assets/images/enfermagem.jpeg',
  'psicologia': '/assets/images/psicologia.jpg',
  'educacao-fisica': '/assets/images/educacao-fisica.jpeg',
  'pedagogia': '/assets/images/pedagogia.jpg',
  'analise-e-desenvolvimento-de-sistemas': '/assets/images/analise-e-desenvolvimento-de-sistemas.jpeg',
  'gestao-de-recursos-humanos': '/assets/images/gestao-de-recursos-humanos.webp',
  'marketing': '/assets/images/marketing.webp',
  'ciencias-contabeis': '/assets/images/ciencias-contabeis.jpg',
  'arquitetura-e-urbanismo': '/assets/images/arquitetura-e-urbanismo.jpg',
  'nutricao': '/assets/images/nutricao.jpg',
  'fisioterapia': '/assets/images/fisioterapia.jpg',
  'engenharia-civil': '/assets/images/engenharia-civil.jpg',
  'engenharia-de-producao': '/assets/images/engenharia-de-producao.jpg',
  'biomedicina': '/assets/images/Biomedicina.jpeg',
  'odontologia': '/assets/images/odontologia.jpg',
  'gestao-comercial': '/assets/images/gestao-comercial.jpeg',
  'farmacia': '/assets/images/farmacia.jpeg',
  'medicina': '/assets/images/medicina.webp',
}

async function main() {
  console.log('🚀 Revertendo URLs das imagens para /public...\n')

  let successCount = 0

  for (const [slug, imageUrl] of Object.entries(IMAGE_URLS)) {
    try {
      await prisma.featuredCourse.update({
        where: { slug },
        data: { imageUrl },
      })
      console.log(`✅ ${slug} → ${imageUrl}`)
      successCount++
    } catch (error) {
      console.log(`❌ ${slug}: ${error instanceof Error ? error.message : 'Erro'}`)
    }
  }

  console.log(`\n✅ ${successCount} cursos atualizados!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
