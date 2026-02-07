'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface HelpCategory {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  order: number
  isActive: boolean
  createdAt: string
  _count: {
    articles: number
  }
}

export default function AdminHelpCenterPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = async () => {
    if (!firebaseUser || !hasPermission('help_center')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/help-center/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        setError('Erro ao carregar categorias')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [firebaseUser, hasPermission])

  const handleDelete = async (categoryId: string) => {
    if (!firebaseUser) return

    setDeleting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccess('Categoria excluída com sucesso!')
        setDeleteConfirm(null)
        fetchCategories()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao excluir categoria')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Erro ao excluir categoria')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (category: HelpCategory) => {
    if (!firebaseUser) return

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/help-center/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      })

      if (response.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id ? { ...c, isActive: !c.isActive } : c
          )
        )
      }
    } catch (err) {
      console.error('Error toggling category:', err)
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Central de Ajuda
          </h1>
          <p className="text-gray-500">
            Gerencie categorias e artigos da central de ajuda
          </p>
        </div>

        <Link
          href="/admin/central-de-ajuda/nova-categoria"
          className="inline-flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Link>
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

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma categoria encontrada</p>
            <Link
              href="/admin/central-de-ajuda/nova-categoria"
              className="inline-flex items-center gap-2 text-bolsa-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Criar primeira categoria
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-4 md:p-6 ${!category.isActive ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-bolsa-primary/10 rounded-xl flex items-center justify-center text-2xl">
                    {category.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                      {!category.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm truncate">{category.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Slug: {category.slug}
                    </p>
                  </div>

                  {/* Articles Count */}
                  <Link
                    href={`/admin/central-de-ajuda/${category.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">{category._count.articles}</span>
                    <span className="text-gray-500 text-sm">artigos</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`p-2 rounded-lg transition-colors ${
                        category.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={category.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <Link
                      href={`/admin/central-de-ajuda/${category.id}/editar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === category.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 mb-3">
                      Tem certeza que deseja excluir a categoria <strong>{category.title}</strong>?
                      {category._count.articles > 0 && (
                        <span className="block text-sm mt-1">
                          Isso também excluirá {category._count.articles} artigo(s) associado(s).
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total de Categorias</p>
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total de Artigos</p>
          <p className="text-2xl font-bold text-gray-900">
            {categories.reduce((acc, c) => acc + c._count.articles, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Categorias Ativas</p>
          <p className="text-2xl font-bold text-gray-900">
            {categories.filter((c) => c.isActive).length}
          </p>
        </div>
      </div>
    </div>
  )
}
