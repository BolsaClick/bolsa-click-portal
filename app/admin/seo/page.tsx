'use client'

import Link from 'next/link'
import { TrendingUp, Search } from 'lucide-react'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

const tools = [
  {
    name: 'Trends & Gap Analysis',
    description: 'Descubra queries em alta no Google que nosso catálogo não cobre e priorize pauta editorial.',
    href: '/admin/seo/trends',
    icon: TrendingUp,
    status: 'mvp',
  },
  {
    name: 'Search Console (em breve)',
    description: 'Queries onde rankeamos próximo do top 10, CTR baixo, impressões — direto do GSC.',
    href: '#',
    icon: Search,
    status: 'planejado',
  },
]

export default function AdminSeoHubPage() {
  const { hasPermission, loading } = useAdmin()

  if (loading) {
    return <div className="p-8 text-ink-500">Carregando…</div>
  }

  if (!hasPermission('seo')) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl text-ink-900">Acesso negado</h1>
        <p className="mt-2 text-ink-700">Você não tem permissão <code>seo</code>.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-ink-900">SEO</h1>
          <p className="mt-2 text-ink-700">
            Ferramentas pra acompanhar e melhorar a presença orgânica do Bolsa Click.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
          {tools.map((t) => {
            const Icon = t.icon
            const disabled = t.status !== 'mvp'
            return (
              <li key={t.name} className="bg-white">
                <Link
                  href={disabled ? '#' : t.href}
                  aria-disabled={disabled}
                  className={`block p-6 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-paper'}`}
                  onClick={(e) => disabled && e.preventDefault()}
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center border border-hairline bg-paper">
                      <Icon size={18} className="text-ink-700" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <h2 className="font-display text-lg text-ink-900">{t.name}</h2>
                        {disabled && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                            {t.status}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700">{t.description}</p>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
