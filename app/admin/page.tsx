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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!firebaseUser) return

      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch('/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [firebaseUser])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Visão geral do sistema Bolsa Click
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total de Usuários"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          href={hasPermission('users') ? '/admin/usuarios' : undefined}
          loading={loading}
        />
        <StatCard
          label="Leads"
          value={stats?.totalLeads || 0}
          icon={Target}
          color="green"
          href={hasPermission('users') ? '/admin/leads' : undefined}
          loading={loading}
        />
        <StatCard
          label="Matrículas"
          value={stats?.totalEnrollments || 0}
          icon={GraduationCap}
          color="purple"
          href={hasPermission('users') ? '/admin/matriculas' : undefined}
          loading={loading}
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${stats?.conversionRate || 0}%`}
          icon={TrendingUp}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Leads (últimos 7 dias)"
          value={stats?.recentLeads || 0}
          icon={Target}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Matrículas Pendentes"
          value={stats?.pendingEnrollments || 0}
          icon={BookOpen}
          color="yellow"
          href={hasPermission('users') ? '/admin/matriculas' : undefined}
          loading={loading}
        />
        <StatCard
          label="Cursos em Destaque"
          value={stats?.featuredCourses || 0}
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
                    {stats?.helpCategories || 0}
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
                    {stats?.helpArticles || 0}
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
