'use client'

import { useEffect, useState } from 'react'
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface BlogCategory {
  id: string
  slug: string
  title: string
  description: string
  order: number
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  _count: { posts: number }
}

interface CategoryForm {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  isActive: boolean
}

const emptyForm: CategoryForm = {
  slug: '',
  title: '',
  description: '',
  metaTitle: '',
  metaDescription: '',
  isActive: true,
}

function generateSlug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminBlogCategoriesPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)

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
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    if (!form.title || !form.slug || !form.description) {
      setError('Título, slug e descrição são obrigatórios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const url = editingId
        ? `/api/admin/blog/categories/${editingId}`
        : '/api/admin/blog/categories'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
        await fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar categoria')
      }
    } catch {
      setError('Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (cat: BlogCategory) => {
    setEditingId(cat.id)
    setForm({
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDescription || '',
      isActive: cat.isActive,
    })
    setShowForm(true)
    setError(null)
  }

  const handleDelete = async (id: string) => {
    if (!firebaseUser || !confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir categoria')
      }
    } catch {
      setError('Erro ao excluir categoria')
    }
  }

  const handleToggleActive = async (cat: BlogCategory) => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/blog/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !cat.isActive }),
      })
      await fetchCategories()
    } catch {
      setError('Erro ao atualizar status')
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-bolsa-primary" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categorias do Blog</h2>
            <p className="text-sm text-gray-500">Gerencie as categorias dos artigos</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setForm(emptyForm)
            setShowForm(true)
            setError(null)
          }}
          className="flex items-center gap-2 bg-bolsa-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setForm(prev => ({
                      ...prev,
                      title,
                      slug: !editingId ? generateSlug(title) : prev.slug,
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="Ex: Bolsas de Estudo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="bolsas-de-estudo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  rows={3}
                  placeholder="Descrição da categoria para SEO"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="Título para mecanismos de busca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  rows={2}
                  placeholder="Descrição para mecanismos de busca"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bolsa-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolsa-primary"></div>
                </label>
                <span className="text-sm text-gray-700">Ativa</span>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-bolsa-primary animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhuma categoria cadastrada</p>
          <p className="text-sm text-gray-400 mt-1">Crie sua primeira categoria para organizar os artigos do blog</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Posts</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className={!cat.isActive ? 'opacity-60' : ''}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cat.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cat._count.posts}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleToggleActive(cat)}>
                      {cat.isActive ? (
                        <Eye size={18} className="text-green-600 mx-auto" />
                      ) : (
                        <EyeOff size={18} className="text-gray-400 mx-auto" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                        title="Editar"
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                        title="Excluir"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
