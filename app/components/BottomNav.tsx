'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User } from 'lucide-react'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'

interface NavItem {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  /** Considera ativo se o pathname bater exato OU começar com esse prefixo. */
  matchPrefix?: string
}

const ITEMS: NavItem[] = [
  { key: 'home', label: 'Início', href: '/', icon: Home },
  { key: 'buscar', label: 'Buscar', href: '/curso/resultado', icon: Search, matchPrefix: '/curso/resultado' },
  { key: 'favoritos', label: 'Favoritos', href: '/favoritos', icon: Heart, matchPrefix: '/favoritos' },
  // minha-conta já auto-redireciona pra /login?redirect=/minha-conta quando
  // deslogado — não precisa de lógica de auth aqui, evita duplicar a regra.
  { key: 'conta', label: 'Conta', href: '/minha-conta', icon: User, matchPrefix: '/minha-conta' },
]

/**
 * Bottom tab bar — padrão de app nativo, só no mobile. Convive com o header
 * (que mantém o menu hambúrguer completo); aqui só os destinos primários.
 * z-40: abaixo de QUALQUER overlay fullscreen que já existe no grupo
 * (default) — drawer de filtros (z-[60], curso/resultado), painel do chat
 * (z-[80]), exit intent (z-[100]), menu mobile do header (z-[999]), cookie
 * preferences (z-[1200]) — pra todos cobrirem o nav quando abertos, em vez
 * dele ficar flutuando por cima.
 */
export default function BottomNav() {
  const pathname = usePathname() || '/'
  const { trackEvent } = usePostHogTracking()

  const isActive = (item: NavItem) => {
    if (item.href === '/') return pathname === '/'
    return pathname.startsWith(item.matchPrefix ?? item.href)
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-hairline pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={() =>
                  trackEvent('bottom_nav_click', { item: item.key, from_path: pathname })
                }
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-mono uppercase tracking-[0.06em] transition-colors"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? 'text-bolsa-secondary' : 'text-ink-400'}
                />
                <span className={active ? 'text-ink-900 font-medium' : 'text-ink-400'}>
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
