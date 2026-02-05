'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface HelpArticle {
  id: string
  slug: string
  title: string
  description: string
  order: number
  isActive: boolean
  publishedAt: string | null
  createdAt: string
}

interface HelpCategory {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  order: number
  isActive: boolean
  articles: HelpArticle[]
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = use(params)
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [category, setCategory] = useState<HelpCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategory = async () => {
    if (!firebaseUser || !hasPermission('help_center')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCategory(data.category)
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

  useEffect(() => {
    fetchCategory()
  }, [firebaseUser, hasPermission, categoryId])

  const handleDeleteArticle = async (articleId: string) => {
    if (!firebaseUser) return

    setDeleting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/articles/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccess('Artigo excluído com sucesso!')
        setDeleteConfirm(null)
        fetchCategory()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao excluir artigo')
      }
    } catch (err) {
      console.error('Error deleting article:', err)
      setError('Erro ao excluir artigo')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleArticleActive = async (article: HelpArticle) => {
    if (!firebaseUser) return

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/articles/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !article.isActive }),
      })

      if (response.ok) {
        setCategory((prev) =>
          prev
            ? {
                ...prev,
                articles: prev.articles.map((a) =>
                  a.id === article.id ? { ...a, isActive: !a.isActive } : a
                ),
              }
            : null
        )
      }
    } catch (err) {
      console.error('Error toggling article:', err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Categoria não encontrada</p>
        <Link
          href="/admin/central-de-ajuda"
          className="text-bolsa-primary hover:underline mt-2 inline-block"
        >
          Voltar para Central de Ajuda
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/central-de-ajuda"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.title}</h1>
              <p className="text-gray-500">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/central-de-ajuda/${categoryId}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar Categoria
          </Link>
          <Link
            href={`/admin/central-de-ajuda/${categoryId}/novo-artigo`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Artigo
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            Artigos ({category.articles.length})
          </h2>
        </div>

        {category.articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum artigo nesta categoria</p>
            <Link
              href={`/admin/central-de-ajuda/${categoryId}/novo-artigo`}
              className="inline-flex items-center gap-2 text-bolsa-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {category.articles.map((article) => (
              <div
                key={article.id}
                className={`p-4 md:p-6 ${!article.isActive ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{article.title}</h3>
                      {!article.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm truncate">{article.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Slug: {article.slug} • Publicado: {formatDate(article.publishedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleArticleActive(article)}
                      className={`p-2 rounded-lg transition-colors ${
                        article.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={article.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {article.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <Link
                      href={`/admin/central-de-ajuda/${categoryId}/artigos/${article.id}/editar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(article.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === article.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 mb-3">
                      Tem certeza que deseja excluir o artigo <strong>{article.title}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Link */}
      <div className="mt-6 text-center">
        <a
          href={`/central-de-ajuda/${category.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bolsa-primary hover:underline text-sm"
        >
          Ver página pública da categoria →
        </a>
      </div>
    </div>
  )
}
