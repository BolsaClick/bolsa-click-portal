import { Course } from "@/app/interface/course"

/**
 * Enriquece cursos com dados mockados pra testar redesign
 * Remove quando dados reais (MEC, enrolledCount) estiverem no backend
 */
export function enrichCourseWithMockData(courses: Course[]): Course[] {
  return courses.map(course => {
    // Se já tem dados reais, não mockar
    if (course.mecScore || course.enrolledCount || course.discount) {
      return course
    }

    // Hash melhor: combina todos os chars do id pra mais variação
    const idStr = String(course.id ?? '')
    const seed = idStr.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 7), 0) % 1000

    // MEC: varia em faixas reais (3.0–4.9, com decimais variados)
    const mecBase = [3.0, 3.3, 3.5, 3.7, 4.0, 4.1, 4.3, 4.5, 4.7, 4.9]
    const mecScore = mecBase[seed % mecBase.length]

    // enrolledCount: sem mock — número fake gera desconfiança
    const enrolledCount = undefined

    // Desconto: a maioria dos cursos EAD tem, mas não todos
    const discountOptions = [0, 0, 30, 40, 50, 60, 65, 70, 80]
    const discount = discountOptions[seed % discountOptions.length]

    // Vagas: maioria ilimitado (null), alguns poucos com urgência real
    const availableSpots = seed % 5 === 0 ? (4 + (seed % 8)) : null

    return {
      ...course,
      mecScore,
      enrolledCount,
      discount,
      availableSpots,
    }
  })
}
