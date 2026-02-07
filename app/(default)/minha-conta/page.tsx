'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Heart,
  GraduationCap,
  LogOut,
  ChevronRight,
  BookOpen,
  Bell,
  Shield,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

interface Stats {
  enrollments: {
    total: number
    inProgress: number
    enrolled: number
  }
  favorites: number
}

export default function MinhaContaPage() {
  const router = useRouter()
  const { user, firebaseUser, loading, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [stats, setStats] = useState<Stats>({
    enrollments: { total: 0, inProgress: 0, enrolled: 0 },
    favorites: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/minha-conta')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (!firebaseUser) {
        setLoadingStats(false)
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()

        // Fetch enrollments and favorites in parallel
        const [enrollmentsRes, favoritesRes] = await Promise.all([
          fetch('/api/user/enrollments', {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch('/api/user/favorites', {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ])

        let enrollmentsData = { enrollments: [] }
        let favoritesData = { favorites: [] }

        if (enrollmentsRes.ok) {
          enrollmentsData = await enrollmentsRes.json()
        }
        if (favoritesRes.ok) {
          favoritesData = await favoritesRes.json()
        }

        const enrollments = enrollmentsData.enrollments || []
        const favorites = favoritesData.favorites || []

        setStats({
          enrollments: {
            total: enrollments.length,
            inProgress: enrollments.filter((e: { status: string }) => e.status === 'IN_PROGRESS').length,
            enrolled: enrollments.filter((e: { status: string }) => e.status === 'ENROLLED').length,
          },
          favorites: favorites.length,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (firebaseUser) {
      fetchStats()
    }
  }, [firebaseUser])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      icon: User,
      label: 'Meus Dados',
      description: 'Informações pessoais e endereço',
      href: '/minha-conta/perfil',
    },
    {
      icon: Heart,
      label: 'Meus Favoritos',
      description: 'Bolsas que você salvou',
      href: '/minha-conta/favoritos',
    },
    {
      icon: GraduationCap,
      label: 'Minhas Matrículas',
      description: 'Acompanhe suas inscrições',
      href: '/minha-conta/matriculas',
    },
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Preferências de comunicação',
      href: '/minha-conta/notificacoes',
    },
    {
      icon: Shield,
      label: 'Segurança',
      description: 'Senha e autenticação',
      href: '/minha-conta/seguranca',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-bolsa-primary to-blue-700 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || 'Avatar'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full border-2 border-white/30"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {user.name?.split(' ')[0] || 'Estudante'}!
              </h1>
              <p className="text-white/80">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                {loadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
                )}
                <p className="text-sm text-gray-500">Favoritos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                {loadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.enrollments.total}</p>
                )}
                <p className="text-sm text-gray-500">Matrículas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                {loadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.enrollments.inProgress}</p>
                )}
                <p className="text-sm text-gray-500">Em andamento</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Alertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index !== 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          Sair da conta
        </button>

        {/* Help Link */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          Precisa de ajuda?{' '}
          <Link href="/central-de-ajuda" className="text-bolsa-primary hover:underline">
            Acesse nossa Central de Ajuda
          </Link>
        </p>
      </div>
    </div>
  )
}
