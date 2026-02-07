/**
 * Script para atualizar as URLs das imagens dos cursos
 *
 * Para executar:
 * npx tsx scripts/update-course-images.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE_UPDATES: Record<string, string> = {
  'administracao': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/administracao-1770321591469.jpg',
  'direito': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/direito-1770321592788.webp',
  'enfermagem': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/enfermagem-1770321593254.jpeg',
  'psicologia': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/psicologia-1770321593711.jpg',
  'educacao-fisica': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/educacao-fisica-1770321594477.jpeg',
  'pedagogia': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/pedagogia-1770321595209.jpg',
  'analise-e-desenvolvimento-de-sistemas': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/analise-e-desenvolvimento-de-sistemas-1770321595646.jpeg',
  'gestao-de-recursos-humanos': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/gestao-de-recursos-humanos-1770321596203.webp',
  'marketing': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/marketing-1770321597144.webp',
  'ciencias-contabeis': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/ciencias-contabeis-1770321597858.jpg',
  'arquitetura-e-urbanismo': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/arquitetura-e-urbanismo-1770321598249.jpg',
  'nutricao': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/nutricao-1770321598677.jpg',
  'fisioterapia': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/fisioterapia-1770321599211.jpg',
  'engenharia-civil': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/engenharia-civil-1770321600666.jpg',
  'engenharia-de-producao': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/engenharia-de-producao-1770321602163.jpg',
  'biomedicina': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/biomedicina-1770321602331.jpeg',
  'odontologia': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/odontologia-1770321602565.jpg',
  'gestao-comercial': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/gestao-comercial-1770321602982.jpeg',
  'farmacia': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/farmacia-1770321604209.jpeg',
  'medicina': 'https://t3.storageapi.dev/categorized-pannier-sosm9i/cursos/medicina-1770321604382.webp',
}

async function main() {
  console.log('🚀 Atualizando imagens dos cursos...\n')

  let successCount = 0
  let errorCount = 0

  for (const [slug, newUrl] of Object.entries(IMAGE_UPDATES)) {
    try {
      await prisma.featuredCourse.update({
        where: { slug },
        data: { imageUrl: newUrl },
      })
      console.log(`✅ ${slug}`)
      successCount++
    } catch (error) {
      console.log(`❌ ${slug}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      errorCount++
    }
  }

  console.log('\n========================================')
  console.log(`✅ ${successCount} cursos atualizados`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erros`)
  }
  console.log('========================================\n')
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
