'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

const EMOJI_OPTIONS = [
  '📚', '💡', '🎓', '💳', '🔐', '📱', '❓', '🏠', '⭐', '🚀',
  '💼', '📝', '🔔', '💬', '📧', '🎯', '✅', '🔧', '📊', '👥',
]

interface HelpCategory {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  order: number
  isActive: boolean
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = use(params)
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📚')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      if (!firebaseUser || !hasPermission('help_center')) return

      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch(`/api/admin/help-center/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          const category: HelpCategory = data.category
          setTitle(category.title)
          setSlug(category.slug)
          setDescription(category.description)
          setIcon(category.icon)
          setIsActive(category.isActive)
        } else {
          setError('Categoria não encontrada')
        }
      } catch (err) {
        console.error('Error fetching category:', err)
        setError('Erro ao carregar categoria')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [firebaseUser, hasPermission, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          icon,
          isActive,
        }),
      })

      if (response.ok) {
        router.push('/admin/central-de-ajuda')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao atualizar categoria')
      }
    } catch (err) {
      console.error('Error updating category:', err)
      setError('Erro ao atualizar categoria')
    } finally {
      setSaving(false)
    }
  }

  if (!hasPermission('help_center')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/central-de-ajuda"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Categoria</h1>
          <p className="text-gray-500">Atualize as informações da categoria</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                    icon === emoji
                      ? 'border-bolsa-primary bg-bolsa-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pagamento e Financeiro"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pagamento-e-financeiro"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /central-de-ajuda/{slug || 'slug-da-categoria'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o conteúdo desta categoria..."
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-bolsa-primary border-gray-300 rounded focus:ring-bolsa-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Categoria ativa (visível no site)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/admin/central-de-ajuda"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !title || !slug || !description}
            className="flex-1 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
