'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Target,
  GraduationCap,
  TrendingUp,
  BookOpen,
  HelpCircle,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import { useBrand } from './_components/BrandProvider'

interface DashboardStats {
  totalUsers: number
  totalLeads: number
  totalEnrollments: number
  pendingEnrollments: number
  recentLeads: number
  conversionRate: number
  helpCategories: number
  helpArticles: number
  featuredCourses: number
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  href?: string
  loading?: boolean
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
  loading,
}: StatCardProps) {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
        {href && (
          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

export default function AdminDashboard() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const { config: activeBrand } = useBrand()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [brandError, setBrandError] = useState<string | null>(null)

  // "0" real (dado veio, é zero mesmo) é diferente de "não sabemos" (a
  // chamada pra marca falhou) — nunca mostrar o segundo caso como se fosse
  // o primeiro. Ver `brandCallKind` em app/lib/admin/brand-client.ts.
  const fmt = (value: number | undefined): string | number => (brandError ? '—' : (value ?? 0))

  useEffect(() => {
    const fetchStats = async () => {
      if (!firebaseUser) return

      setLoading(true)
      setBrandError(null)
      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch('/api/admin/brand/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()

        if (response.ok) {
          setStats(data)
        } else {
          // Nunca renderizar "0" como se fosse dado real quando a marca
          // remota falhou — ver `brandCallKind` em `app/lib/admin/brand-client.ts`.
          setStats(null)
          setBrandError(data?.error || `Falha ao carregar estatísticas (HTTP ${response.status})`)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(null)
        setBrandError('Falha de rede ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [firebaseUser, activeBrand.id])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Visão geral do sistema — marca{' '}
          <span className="font-medium" style={{ color: activeBrand.color }}>
            {activeBrand.label}
          </span>
        </p>
      </div>

      {brandError && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {brandError}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total de Usuários"
          value={fmt(stats?.totalUsers)}
          icon={Users}
          color="blue"
          href={hasPermission('users') ? '/admin/usuarios' : undefined}
          loading={loading}
        />
        <StatCard
          label="Leads"
          value={fmt(stats?.totalLeads)}
          icon={Target}
          color="green"
          href={hasPermission('users') ? '/admin/leads' : undefined}
          loading={loading}
        />
        <StatCard
          label="Matrículas"
          value={fmt(stats?.totalEnrollments)}
          icon={GraduationCap}
          color="purple"
          href={hasPermission('users') ? '/admin/matriculas' : undefined}
          loading={loading}
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${fmt(stats?.conversionRate)}${brandError ? '' : '%'}`}
          icon={TrendingUp}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Leads (últimos 7 dias)"
          value={fmt(stats?.recentLeads)}
          icon={Target}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Matrículas Pendentes"
          value={fmt(stats?.pendingEnrollments)}
          icon={BookOpen}
          color="yellow"
          href={hasPermission('users') ? '/admin/matriculas' : undefined}
          loading={loading}
        />
        <StatCard
          label="Cursos em Destaque"
          value={fmt(stats?.featuredCourses)}
          icon={GraduationCap}
          color="pink"
          href={hasPermission('courses') ? '/admin/cursos' : undefined}
          loading={loading}
        />
      </div>

      {/* Content Stats */}
      {hasPermission('help_center') && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Central de Ajuda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {fmt(stats?.helpCategories)}
                  </p>
                )}
                <p className="text-sm text-gray-500">Categorias</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {fmt(stats?.helpArticles)}
                  </p>
                )}
                <p className="text-sm text-gray-500">Artigos</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/central-de-ajuda"
              className="text-sm text-bolsa-primary hover:underline flex items-center gap-1"
            >
              Gerenciar Central de Ajuda
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
