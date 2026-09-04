import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  AUTH_REDIRECT_TARGET,
  PUBLIC_AUTH_ROUTES_ENABLED,
} from '@/app/lib/auth/public-auth-visibility'

export const metadata: Metadata = {
  title: 'Autenticação',
  robots: 'noindex, nofollow',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ponto de controle único das rotas públicas de auth (/login, /cadastro,
  // /recuperar-senha): as páginas seguem no repo, só deixam de ser
  // alcançáveis. Ver app/lib/auth/public-auth-visibility.ts.
  // NÃO afeta /admin/login, que fica fora deste route group e tem auth própria.
  if (!PUBLIC_AUTH_ROUTES_ENABLED) {
    redirect(AUTH_REDIRECT_TARGET)
  }

  return <>{children}</>
}
