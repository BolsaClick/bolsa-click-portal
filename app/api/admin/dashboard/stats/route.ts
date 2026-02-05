import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(auth)) return auth

  try {
    const [
      totalUsers,
      totalLeads,
      totalEnrollments,
      pendingEnrollments,
      recentLeads,
      convertedLeads,
      helpCategories,
      helpArticles,
      featuredCourses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.lead.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.lead.count({ where: { status: 'CONVERTED' } }),
      prisma.helpCategory.count(),
      prisma.helpArticle.count(),
      prisma.featuredCourse.count(),
    ])

    const conversionRate =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    return NextResponse.json({
      totalUsers,
      totalLeads,
      totalEnrollments,
      pendingEnrollments,
      recentLeads,
      conversionRate,
      helpCategories,
      helpArticles,
      featuredCourses,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
