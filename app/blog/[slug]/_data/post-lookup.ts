/**
 * Busca de post do blog por slug, extraída de `page.tsx` pra um módulo comum
 * — reaproveitada por `page.tsx` e por `opengraph-image.tsx`. Next.js
 * restringe o que um `page.tsx` pode exportar (o plugin de TypeScript acusa
 * "no exported member" pra quem tenta importar outros nomes de lá, mesmo com
 * `export` presente), então o compartilhamento passa por aqui em vez de
 * `import ... from '../page'`.
 */
import { prisma } from '@/app/lib/prisma'

export async function getPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug, isActive: true, publishedAt: { not: null } },
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}
