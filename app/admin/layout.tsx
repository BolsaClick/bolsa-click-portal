import { cookies } from 'next/headers'
import { BRAND_COOKIE_NAME, DEFAULT_BRAND, isBrandId } from '@/app/lib/admin/brands'
import { listBrandStatuses } from '@/app/lib/admin/brand-client'
import AdminLayoutClient from './_components/AdminLayoutClient'

// Server component: lê a marca ativa do cookie de servidor (nunca
// localStorage — precisa estar disponível já no primeiro render do server,
// pra nenhuma tela do painel nascer "sem saber" qual marca está editando) e
// calcula a disponibilidade de cada marca (chave configurada ou não) antes
// de qualquer coisa renderizar no cliente.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const rawBrand = cookieStore.get(BRAND_COOKIE_NAME)?.value
  const initialBrand = isBrandId(rawBrand) ? rawBrand : DEFAULT_BRAND
  const statuses = listBrandStatuses()

  return (
    <AdminLayoutClient initialBrand={initialBrand} statuses={statuses}>
      {children}
    </AdminLayoutClient>
  )
}
