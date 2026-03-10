'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  FileText,
  Loader2,
  Upload,
  X,
  ArrowLeft,
  Eye,
  Code2,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import SEOPanel from '@/app/components/atoms/SEOPanel'
import CategoryMultiSelect from '@/app/components/atoms/CategoryMultiSelect'

const RichTextEditor = dynamic(
  () => import('@/app/components/atoms/RichTextEditor'),
  { ssr: false, loading: () => <div className="h-[300px] border border-gray-300 rounded-lg animate-pulse bg-gray-50" /> }
)

interface BlogCategory {
  id: string
  slug: string
  title: string
}

interface PostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  categoryIds: string[]
  tags: string
  featuredImage: string
  imageAlt: string
  author: string
  metaTitle: string
  metaDescription: string
  keywords: string
  isActive: boolean
  featured: boolean
  publishedAt: string | null
}

export default function AdminBlogEditPostPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [form, setForm] = useState<PostForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'rich' | 'source'>('rich')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!firebaseUser) return
      try {
        const token = await firebaseUser.getIdToken()
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/admin/blog/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/blog/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (postRes.ok) {
          const { post } = await postRes.json()
          setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            categoryIds: (post.categories || []).map((c: BlogCategory) => c.id),
            tags: (post.tags || []).join(', '),
            featuredImage: post.featuredImage || '',
            imageAlt: post.imageAlt || '',
            author: post.author || 'Equipe Bolsa Click',
            metaTitle: post.metaTitle || '',
            metaDescription: post.metaDescription || '',
            keywords: (post.keywords || []).join(', '),
            isActive: post.isActive,
            featured: post.featured,
            publishedAt: post.publishedAt,
          })
        } else {
          setError('Post não encontrado')
        }

        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories)
        }
      } catch {
        setError('Erro ao carregar post')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [firebaseUser, postId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser || !form) return

    setUploading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const token = await firebaseUser.getIdToken()
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            folder: 'blog',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setForm(prev => prev ? { ...prev, featuredImage: data.url } : prev)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Erro ao fazer upload da imagem')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const handleContentImageUpload = useCallback(async (file: File): Promise<string> => {
    if (!firebaseUser) throw new Error('Não autenticado')

    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string
          const token = await firebaseUser.getIdToken()
          const response = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              file: base64,
              filename: file.name,
              folder: 'blog',
            }),
          })

          if (response.ok) {
            const data = await response.json()
            resolve(data.url)
          } else {
            const errorData = await response.json()
            reject(new Error(errorData.error || 'Erro ao fazer upload'))
          }
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsDataURL(file)
    })
  }, [firebaseUser])

  const handleSubmit = async (publishNow?: boolean) => {
    if (!firebaseUser || !form) return

    if (!form.title || !form.slug || !form.excerpt || !form.content || form.categoryIds.length === 0) {
      setError('Título, slug, resumo, conteúdo e pelo menos uma categoria são obrigatórios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()

      const body: Record<string, unknown> = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        categoryIds: form.categoryIds,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        featuredImage: form.featuredImage || null,
        imageAlt: form.imageAlt || null,
        author: form.author,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        isActive: form.isActive,
        featured: form.featured,
        updatedBy: firebaseUser.uid,
      }

      if (publishNow === true) {
        body.publishedAt = new Date().toISOString()
      } else if (publishNow === false) {
        body.publishedAt = null
      }

      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/admin/blog')
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao atualizar post')
      }
    } catch {
      setError('Erro ao atualizar post')
    } finally {
      setSaving(false)
    }
  }

  if (!hasPermission('blog')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="text-bolsa-primary animate-spin" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="text-bolsa-primary" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Post</h2>
            <p className="text-sm text-gray-500">
              {form.publishedAt ? 'Publicado' : 'Rascunho'} &middot; /{form.slug}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Editor Column */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            {/* Title + Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => prev ? { ...prev, title: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (Excerpt) *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => prev ? { ...prev, excerpt: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Conteúdo *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorMode(editorMode === 'rich' ? 'source' : 'rich')}
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition ${
                      editorMode === 'source'
                        ? 'bg-gray-200 text-gray-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Code2 size={14} />
                    HTML
                  </button>
                  {editorMode === 'source' && (
                    <button
                      type="button"
                      onClick={() => setEditorMode('rich')}
                      className="flex items-center gap-1 text-sm text-bolsa-primary hover:underline"
                    >
                      <Eye size={14} />
                      Editor visual
                    </button>
                  )}
                </div>
              </div>
              {editorMode === 'rich' ? (
                <RichTextEditor
                  content={form.content}
                  onChange={(html) => setForm(prev => prev ? { ...prev, content: html } : prev)}
                  onImageUpload={handleContentImageUpload}
                />
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => setForm(prev => prev ? { ...prev, content: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent font-mono text-sm"
                  rows={15}
                />
              )}
            </div>

            {/* Category + Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategoryMultiSelect
                categories={categories}
                selectedIds={form.categoryIds}
                onChange={(ids) => setForm(prev => prev ? { ...prev, categoryIds: ids } : prev)}
                onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
                firebaseUser={firebaseUser}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm(prev => prev ? { ...prev, author: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags + Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm(prev => prev ? { ...prev, tags: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords SEO (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm(prev => prev ? { ...prev, keywords: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Destaque</label>
              {form.featuredImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={form.featuredImage} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => prev ? { ...prev, featuredImage: '' } : prev)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-bolsa-primary transition"
                >
                  {uploading ? (
                    <Loader2 size={32} className="text-bolsa-primary animate-spin" />
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Clique para fazer upload</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF ou WebP (recomendado: 1200x630)</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Image Alt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto alternativo da imagem (SEO)</label>
              <input
                type="text"
                value={form.imageAlt}
                onChange={(e) => setForm(prev => prev ? { ...prev, imageAlt: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm(prev => prev ? { ...prev, metaTitle: e.target.value } : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                    placeholder="Título para mecanismos de busca (máx. 60 caracteres)"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm(prev => prev ? { ...prev, metaDescription: e.target.value } : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                    rows={2}
                    placeholder="Descrição para mecanismos de busca (máx. 160 caracteres)"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 caracteres</p>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 border-t pt-6">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => prev ? { ...prev, isActive: e.target.checked } : prev)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bolsa-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolsa-primary"></div>
                </label>
                <span className="text-sm text-gray-700">Ativo</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm(prev => prev ? { ...prev, featured: e.target.checked } : prev)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bolsa-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
                <span className="text-sm text-gray-700">Destaque</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Link
                href="/admin/blog"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </Link>
              {form.publishedAt ? (
                <>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    Despublicar
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Salvar Rascunho
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Publicar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SEO Panel Sidebar */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="xl:sticky xl:top-4">
            <SEOPanel
              title={form.title}
              metaTitle={form.metaTitle}
              metaDescription={form.metaDescription}
              excerpt={form.excerpt}
              content={form.content}
              slug={form.slug}
              featuredImage={form.featuredImage}
              imageAlt={form.imageAlt}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
