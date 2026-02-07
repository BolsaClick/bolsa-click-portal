'use client'

import { useState } from 'react'
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

export default function NewCategoryPage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📚')
  const [isActive, setIsActive] = useState(true)

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setLoading(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/help-center/categories', {
        method: 'POST',
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
        setError(data.error || 'Erro ao criar categoria')
      }
    } catch (err) {
      console.error('Error creating category:', err)
      setError('Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission('help_center')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Nova Categoria</h1>
          <p className="text-gray-500">Crie uma nova categoria na central de ajuda</p>
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
            disabled={loading || !title || !slug || !description}
            className="flex-1 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Categoria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
