'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Building2,
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
  LayoutGrid,
  LayoutList,
  Search,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatCurrency } from '@/utils/fomartCurrency'
import { toast } from 'sonner'

interface Favorite {
  id: string
  courseId: string
  courseName: string
  courseSlug: string
  institutionName: string | null
  modalidade: string | null
  price: number | null
  discount: number | null
  createdAt: string
}

// Mapeamento de logos das instituições
const institutionLogos: Record<string, string> = {
  ANHANGUERA: '/assets/brands/anhanguera-logo.png',
  UNOPAR: '/assets/brands/unopar-logo.png',
  PITÁGORAS: '/assets/brands/pitagoras-logo.png',
  UNIC: '/assets/brands/unic-logo.png',
  UNIDERP: '/assets/brands/uniderp-logo.png',
  UNIME: '/assets/brands/unime-logo.png',
}

function formatModalidade(value: string | null): string {
  if (!value) return ''
  const upper = value.toUpperCase()
  switch (upper) {
    case 'EAD':
      return 'EAD'
    case 'PRESENCIAL':
      return 'Presencial'
    case 'SEMIPRESENCIAL':
      return 'Semipresencial'
    default:
      return value
  }
}

export default function FavoritosPage() {
  const router = useRouter()
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/minha-conta/favoritos')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!firebaseUser) return

      try {
        const idToken = await firebaseUser.getIdToken()
        const response = await fetch('/api/user/favorites', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Erro ao carregar favoritos')
        }

        const data = await response.json()
        setFavorites(data.favorites || [])
      } catch (err) {
        console.error('Error fetching favorites:', err)
        setError('Não foi possível carregar seus favoritos')
      } finally {
        setLoading(false)
      }
    }

    if (firebaseUser) {
      fetchFavorites()
    }
  }, [firebaseUser])

  const handleRemoveFavorite = async (courseId: string) => {
    if (!firebaseUser) return

    setRemovingId(courseId)
    try {
      const idToken = await firebaseUser.getIdToken()
      const response = await fetch(`/api/user/favorites?courseId=${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao remover favorito')
      }

      setFavorites((prev) => prev.filter((f) => f.courseId !== courseId))
      toast.success('Curso removido dos favoritos')
    } catch (err) {
      console.error('Error removing favorite:', err)
      toast.error('Erro ao remover favorito')
    } finally {
      setRemovingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className="pt-24 pb-6">
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <Link
                href="/minha-conta"
                className="inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-bolsa-secondary text-neutral-50 hover:bg-slate-600 focus:ring-bolsa-secondary/20"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Voltar para Minha Conta</span>
              </Link>
              <div className="flex items-center space-x-2 flex-shrink-0 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-neutral-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-emerald-50 text-bolsa-secondary'
                        : 'text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-emerald-50 text-bolsa-secondary'
                        : 'text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    <LayoutList size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Heart size={20} className="text-pink-300" fill="currentColor" />
                  <h1 className="text-xl font-bold text-emerald-50">Meus Favoritos</h1>
                </div>
                <p className="text-sm text-emerald-100">
                  {favorites.length} {favorites.length === 1 ? 'curso salvo' : 'cursos salvos'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl pt-8 pb-16 px-4">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && favorites.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum curso favoritado
            </h2>
            <p className="text-gray-500 mb-6">
              Você ainda não salvou nenhum curso nos favoritos. Explore nossos cursos e salve os que mais gostar!
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 bg-bolsa-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-bolsa-primary/90 transition-colors"
            >
              Explorar Cursos
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length > 0 && (
          <AnimatePresence>
            <div
              className={`grid ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'grid-cols-1 gap-4'
              }`}
            >
              {favorites.map((favorite) => {
                const institutionKey = favorite.institutionName?.toUpperCase() || ''
                const logoSrc = institutionLogos[institutionKey] || '/assets/brands/default-logo.png'

                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Logo/Header */}
                    <div
                      className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 ${
                        viewMode === 'list' ? 'w-32 flex-shrink-0 flex items-center justify-center' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Image
                          src={logoSrc}
                          alt={favorite.institutionName || 'Instituição'}
                          width={viewMode === 'list' ? 80 : 100}
                          height={viewMode === 'list' ? 30 : 40}
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assets/brands/default-logo.png'
                          }}
                        />
                        {viewMode === 'grid' && (
                          <button
                            onClick={() => handleRemoveFavorite(favorite.courseId)}
                            disabled={removingId === favorite.courseId}
                            className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors disabled:opacity-50"
                            title="Remover dos favoritos"
                          >
                            {removingId === favorite.courseId ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Heart className="w-5 h-5" fill="currentColor" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {favorite.courseName}
                        </h3>

                        <div className="space-y-1 mb-3">
                          {favorite.institutionName && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span>{favorite.institutionName}</span>
                            </div>
                          )}
                          {favorite.modalidade && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{formatModalidade(favorite.modalidade)}</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        {favorite.price && (
                          <div className="mb-3">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(favorite.price)}
                              <span className="text-sm font-normal text-gray-500">/mês</span>
                            </p>
                            {favorite.discount && favorite.discount > 0 && (
                              <p className="text-xs text-green-600">
                                {favorite.discount}% de desconto
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className={`flex gap-2 ${
                          viewMode === 'list' ? 'flex-col ml-4' : 'flex-col'
                        }`}
                      >
                        <Link
                          href={`/curso/${favorite.courseSlug}`}
                          className="flex items-center justify-center gap-2 bg-bolsa-primary text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-bolsa-primary/90 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                          Ver ofertas
                        </Link>
                        {viewMode === 'list' && (
                          <button
                            onClick={() => handleRemoveFavorite(favorite.courseId)}
                            disabled={removingId === favorite.courseId}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {removingId === favorite.courseId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Help Link */}
        <p className="text-center mt-8 text-gray-500 text-sm">
          Procurando mais cursos?{' '}
          <Link href="/cursos" className="text-bolsa-primary hover:underline">
            Explore todas as opções
          </Link>
        </p>
      </div>
    </div>
  )
}
