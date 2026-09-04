import { redirect } from 'next/navigation'
import {
  AUTH_REDIRECT_TARGET,
  MINHA_CONTA_REDIRECT_ENABLED,
} from '@/app/lib/auth/public-auth-visibility'

/**
 * PONTO DE CONTROLE ÚNICO do /minha-conta/* (inclui favoritos, matriculas e
 * perfil). Hoje a flag é `false`: a área saiu dos menus mas as páginas seguem
 * funcionando por URL direta, pra quem tem necessidade real (ver matrícula).
 *
 * Se a decisão virar "redireciona tudo", é só ligar MINHA_CONTA_REDIRECT_ENABLED
 * em app/lib/auth/public-auth-visibility.ts — uma linha, um lugar.
 */
export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (MINHA_CONTA_REDIRECT_ENABLED) {
    redirect(AUTH_REDIRECT_TARGET)
  }

  return <>{children}</>
}
