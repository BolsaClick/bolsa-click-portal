'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  GripVertical,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface FeaturedCourse {
  id: string
  slug: string
  name: string
  fullName: string
  type: string
  nivel: string
  description: string
  imageUrl: string
  marketDemand: string
  order: number
  isActive: boolean
}

const typeLabels: Record<string, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
}

const nivelLabels: Record<string, string> = {
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
}

const demandLabels: Record<string, { label: string; color: string }> = {
  ALTA: { label: 'Alta', color: 'bg-green-100 text-green-800' },
  MEDIA: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  BAIXA: { label: 'Baixa', color: 'bg-red-100 text-red-800' },
}

export default function AdminCoursesPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [courses, setCourses] = useState<FeaturedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCourses = async () => {
    if (!firebaseUser || !hasPermission('courses')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/featured-courses', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      } else {
        setError('Erro ao carregar cursos')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [firebaseUser, hasPermission])

  const handleDelete = async (courseId: string) => {
    if (!firebaseUser) return

    setDeleting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/featured-courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccess('Curso excluído com sucesso!')
        setDeleteConfirm(null)
        fetchCourses()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao excluir curso')
      }
    } catch (err) {
      console.error('Error deleting course:', err)
      setError('Erro ao excluir curso')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (course: FeaturedCourse) => {
    if (!firebaseUser) return

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/featured-courses/${course.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !course.isActive }),
      })

      if (response.ok) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, isActive: !c.isActive } : c
          )
        )
      }
    } catch (err) {
      console.error('Error toggling course:', err)
    }
  }

  if (!hasPermission('courses')) {
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
            <GraduationCap className="w-6 h-6" />
            Cursos em Destaque
          </h1>
          <p className="text-gray-500">
            Gerencie os cursos em destaque exibidos no site
          </p>
        </div>

        <Link
          href="/admin/cursos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
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

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhum curso em destaque cadastrado</p>
          <Link
            href="/admin/cursos/novo"
            className="inline-flex items-center gap-2 text-bolsa-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Adicionar primeiro curso
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const demand = demandLabels[course.marketDemand] || demandLabels.MEDIA

            return (
              <div
                key={course.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  !course.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Image */}
                  <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.name}
                        width={96}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      {!course.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm truncate">{course.fullName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {typeLabels[course.type] || course.type}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {nivelLabels[course.nivel] || course.nivel}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${demand.color}`}>
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        {demand.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(course)}
                      className={`p-2 rounded-lg transition-colors ${
                        course.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={course.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {course.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <Link
                      href={`/admin/cursos/${course.id}/editar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(course.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === course.id && (
                  <div className="p-4 bg-red-50 border-t border-red-200">
                    <p className="text-red-700 mb-3">
                      Tem certeza que deseja excluir o curso <strong>{course.name}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(course.id)}
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
            )
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total de Cursos</p>
          <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Cursos Ativos</p>
          <p className="text-2xl font-bold text-gray-900">
            {courses.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Alta Demanda</p>
          <p className="text-2xl font-bold text-gray-900">
            {courses.filter((c) => c.marketDemand === 'ALTA').length}
          </p>
        </div>
      </div>
    </div>
  )
}
