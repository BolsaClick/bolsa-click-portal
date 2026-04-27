import { prisma } from '@/app/lib/prisma'
import ScholarshipCarouselClient from './ScholarshipCarouselClient'

export default async function ScholarshipCarousel() {
  let courses: {
    id: string;
    slug: string;
    name: string;
    fullName: string;
    type: string;
    description: string;
    duration: string;
    averageSalary: string;
    marketDemand: string;
    imageUrl: string;
  }[] = []

  try {
    courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 10,
      select: {
        id: true,
        slug: true,
        name: true,
        fullName: true,
        type: true,
        description: true,
        duration: true,
        averageSalary: true,
        marketDemand: true,
        imageUrl: true,
      },
    })
  } catch {
    // Fallback to empty
  }

  if (courses.length === 0) return null

  return <ScholarshipCarouselClient courses={courses} />
}
