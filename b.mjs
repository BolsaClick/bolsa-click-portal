import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
try { const n = await p.banner.count({ where: { isActive: true } }); console.log('  banners ativos:', n) }
catch(e){ console.log('  ', e.message.split('\n')[0].slice(0,80)) }
await p.$disconnect()
