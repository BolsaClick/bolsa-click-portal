import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, author: true, title: true },
    orderBy: { publishedAt: 'desc' },
  })

  console.log('Posts atuais:')
  for (const p of posts) {
    console.log(`  "${p.author}" | ${p.title.slice(0, 60)}`)
  }

  const result = await prisma.blogPost.updateMany({
    where: { author: 'Equipe Bolsa Click' },
    data: { author: 'Mariana Fonseca' },
  })

  console.log(`\nAtualizado: ${result.count} posts → "Mariana Fonseca"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
