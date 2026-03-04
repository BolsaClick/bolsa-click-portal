'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Search,
  FolderOpen,
  Star,
  Calendar,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  featuredImage: string | null
  author: string
  readingTime: number
  isActive: boolean
  featured: boolean
  publishedAt: string | null
  createdAt: string
  category: { id: string; title: string; slug: string }
}

interface BlogCategory {
  id: string
  slug: string
  title: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminBlogPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 12, total: 0, totalPages: 0,
  })

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchPosts = async (page = 1) => {
    if (!firebaseUser) return
    try {
      setLoading(true)
      const token = await firebaseUser.getIdToken()
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        status: statusFilter,
      })
      if (search) params.set('search', search)
      if (categoryFilter) params.set('categoryId', categoryFilter)

      const res = await fetch(`/api/admin/blog/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
        setPagination(data.pagination)
      }
    } catch {
      setError('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/blog/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  useEffect(() => {
    fetchPosts(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, statusFilter, categoryFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts(1)
  }

  const handleToggleActive = async (post: BlogPost) => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !post.isActive }),
      })
      await fetchPosts(pagination.page)
    } catch {
      setError('Erro ao atualizar status')
    }
  }

  const handleToggleFeatured = async (post: BlogPost) => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !post.featured }),
      })
      await fetchPosts(pagination.page)
    } catch {
      setError('Erro ao atualizar destaque')
    }
  }

  const handleDelete = async (id: string) => {
    if (!firebaseUser || !confirm('Tem certeza que deseja excluir este post?')) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        await fetchPosts(pagination.page)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir post')
      }
    } catch {
      setError('Erro ao excluir post')
    }
  }

  if (!hasPermission('blog')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-bolsa-primary" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blog</h2>
            <p className="text-sm text-gray-500">Gerencie os artigos do blog</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/categorias"
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FolderOpen size={18} />
            Categorias
          </Link>
          <Link
            href="/admin/blog/novo"
            className="flex items-center gap-2 bg-bolsa-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={20} />
            Novo Post
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
          </div>
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
        >
          <option value="">Todas categorias</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-bolsa-primary animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum post encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Crie seu primeiro artigo para o blog</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                !post.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  {post.featured && (
                    <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                  {!post.publishedAt && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Rascunho
                    </span>
                  )}
                  {!post.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {post.category.title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readingTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('pt-BR')
                      : new Date(post.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleFeatured(post)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title={post.featured ? 'Remover destaque' : 'Destacar'}
                >
                  <Star size={18} className={post.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                </button>
                <button
                  onClick={() => handleToggleActive(post)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title={post.isActive ? 'Desativar' : 'Ativar'}
                >
                  {post.isActive ? (
                    <Eye size={18} className="text-green-600" />
                  ) : (
                    <EyeOff size={18} className="text-gray-400" />
                  )}
                </button>
                <Link
                  href={`/admin/blog/${post.id}/editar`}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Editar"
                >
                  <Pencil size={18} className="text-blue-600" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Excluir"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchPosts(page)}
              className={`px-3 py-1 rounded-lg text-sm ${
                page === pagination.page
                  ? 'bg-bolsa-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
