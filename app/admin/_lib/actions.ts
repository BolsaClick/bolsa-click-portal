'use server'

import { cookies } from 'next/headers'
import { BRAND_COOKIE_NAME, isBrandId, type BrandId } from '@/app/lib/admin/brands'

/**
 * Troca a marca ativa do painel. Cookie de SERVIDOR (não localStorage) —
 * lido em `app/admin/layout.tsx` (server component) e em
 * `app/api/admin/brand/[...path]/route.ts`, pra saber contra qual marca
 * disparar cada chamada. `path: '/'` porque tanto páginas (`/admin/*`)
 * quanto rotas de API (`/api/admin/*`) precisam ler o mesmo cookie.
 *
 * Não concede nenhum acesso por si só — só escolhe qual registro de
 * `BRANDS` usar; a auth de verdade (sessão Firebase do admin) continua
 * sendo checada em cada rota. Por isso não exige permissão extra aqui,
 * mas valida contra `isBrandId` pra nunca gravar lixo no cookie.
 */
export async function setAdminBrand(brand: string): Promise<void> {
  if (!isBrandId(brand)) return

  const store = await cookies()
  store.set(BRAND_COOKIE_NAME, brand satisfies BrandId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
}
