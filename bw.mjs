import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const b = await p.banner.findFirst({ where: { isActive: true }, select: { imageUrl: true } })
console.log('  url:', b?.imageUrl?.slice(-30))
await p.$disconnect()
