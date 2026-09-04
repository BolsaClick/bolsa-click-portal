import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
for (const [nome, sql] of [['ba_user','SELECT COUNT(*)::int n FROM "ba_user"'],['ba_session','SELECT COUNT(*)::int n FROM "ba_session"']]) {
  try { const r = await p.$queryRawUnsafe(sql); console.log(`  ${nome}: ${r[0].n} linhas`) }
  catch (e) { console.log(`  ${nome}: ${e.message.split('\n')[0].slice(0,60)}`) }
}
await p.$disconnect()
