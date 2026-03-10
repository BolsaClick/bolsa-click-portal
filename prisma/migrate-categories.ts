/**
 * Migration script: categoryId → categories many-to-many
 * Already executed. Kept for reference only.
 *
 * This script was used to migrate data from the old categoryId FK
 * to the new many-to-many join table (_BlogCategoryToBlogPost).
 *
 * It is no longer runnable since categoryId was removed from the schema.
 */

// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
// async function main() {
//   const posts = await prisma.$queryRaw`SELECT id, "categoryId" FROM "BlogPost" WHERE "categoryId" IS NOT NULL`
//   for (const post of posts as any[]) {
//     await prisma.blogPost.update({
//       where: { id: post.id },
//       data: { categories: { connect: { id: post.categoryId } } },
//     })
//   }
//   console.log('Migration complete!')
// }
// main().catch(console.error).finally(() => prisma.$disconnect())
