'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface HelpArticle {
  id: string
  slug: string
  title: string
  description: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  keywords: string[]
  isActive: boolean
  category: {
    id: string
    title: string
    slug: string
  }
}

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ categoryId: string; articleId: string }>
}) {
  const { categoryId, articleId } = use(params)
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!firebaseUser || !hasPermission('help_center')) return

      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch(`/api/admin/help-center/articles/${articleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          const art: HelpArticle = data.article
          setArticle(art)
          setTitle(art.title)
          setSlug(art.slug)
          setDescription(art.description)
          setContent(art.content)
          setMetaTitle(art.metaTitle || '')
          setMetaDescription(art.metaDescription || '')
          setKeywords(art.keywords || [])
          setIsActive(art.isActive)
        } else {
          setError('Artigo não encontrado')
        }
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Erro ao carregar artigo')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [firebaseUser, hasPermission, articleId])

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || description,
          keywords,
          isActive,
        }),
      })

      if (response.ok) {
        router.push(`/admin/central-de-ajuda/${categoryId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao atualizar artigo')
      }
    } catch (err) {
      console.error('Error updating article:', err)
      setError('Erro ao atualizar artigo')
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

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Artigo não encontrado</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/central-de-ajuda/${categoryId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Artigo</h1>
          <p className="text-gray-500">Categoria: {article.category.title}</p>
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Conteúdo</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como alterar minha senha?"
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
                placeholder="como-alterar-minha-senha"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /central-de-ajuda/{article.category.slug}/{slug || 'slug-do-artigo'}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição curta *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uma breve descrição do artigo que aparece nas listagens..."
                required
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo completo do artigo aqui..."
                required
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Suporta formatação Markdown
              </p>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">SEO</h2>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Título
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'Título para SEO'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Descrição
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={description || 'Descrição para SEO'}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palavras-chave
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Adicionar palavra-chave..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Configurações</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-bolsa-primary border-gray-300 rounded focus:ring-bolsa-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Artigo ativo (publicado e visível no site)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/admin/central-de-ajuda/${categoryId}`}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !title || !slug || !description || !content}
            className="flex-1 px-4 py-3 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
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

      {/* Preview Link */}
      <div className="mt-6 text-center">
        <a
          href={`/central-de-ajuda/${article.category.slug}/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bolsa-primary hover:underline text-sm"
        >
          Ver artigo no site →
        </a>
      </div>
    </div>
  )
}
