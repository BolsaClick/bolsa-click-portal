// llms-full.txt — dump de cursos/carreiras/faculdades (llmstxt.org).
// O índice curto com claims travados está em /llms.txt.

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { buildFullLlmsTxt } from '../llms.txt/build'

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

  const body = buildFullLlmsTxt({ courses, institutions, blogPosts })

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
