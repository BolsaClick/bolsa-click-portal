import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { prisma } from '@/app/lib/prisma'

// Mapeamento das novas URLs das imagens no Tigris Storage
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

/**
 * POST /api/admin/update-course-images
 * Atualiza as URLs das imagens dos cursos para o Tigris Storage
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request)
  if (isAuthError(authResult)) return authResult

  try {
    const results: { slug: string; success: boolean; newUrl?: string; error?: string }[] = []

    for (const [slug, newUrl] of Object.entries(IMAGE_UPDATES)) {
      try {
        await prisma.featuredCourse.update({
          where: { slug },
          data: { imageUrl: newUrl },
        })
        results.push({ slug, success: true, newUrl })
      } catch (error) {
        results.push({
          slug,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Atualização concluída: ${successCount} sucesso, ${errorCount} erros`,
      results,
    })
  } catch (error) {
    console.error('Error updating course images:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar imagens dos cursos' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/update-course-images
 * Lista os cursos e suas URLs atuais
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request)
  if (isAuthError(authResult)) return authResult

  try {
    const courses = await prisma.featuredCourse.findMany({
      select: {
        slug: true,
        name: true,
        imageUrl: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      courses,
      pendingUpdates: Object.keys(IMAGE_UPDATES).length,
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    )
  }
}
