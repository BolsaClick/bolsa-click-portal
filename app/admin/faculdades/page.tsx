'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
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
  Star,
  MapPin,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Institution {
  id: string
  slug: string
  name: string
  shortName: string
  fullName: string
  description: string
  type: string
  headquartersCity: string | null
  headquartersState: string | null
  mecRating: number | null
  campusCount: number | null
  studentCount: string | null
  logoUrl: string
  isActive: boolean
  order: number
  modalities: string[]
}

const typeLabels: Record<string, string> = {
  PRIVADA: 'Privada',
  PUBLICA_FEDERAL: 'Pública Federal',
  PUBLICA_ESTADUAL: 'Pública Estadual',
}

export default function AdminFaculdadesPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchInstitutions = async () => {
    if (!firebaseUser || !hasPermission('courses')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setInstitutions(data.institutions)
      } else {
        setError('Erro ao carregar faculdades')
      }
    } catch (err) {
      console.error('Error fetching institutions:', err)
      setError('Erro ao carregar faculdades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [firebaseUser, hasPermission])

  const handleDelete = async (id: string) => {
    if (!firebaseUser) return

    setDeleting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/institutions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccess('Faculdade excluída com sucesso!')
        setDeleteConfirm(null)
        fetchInstitutions()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao excluir faculdade')
      }
    } catch (err) {
      console.error('Error deleting institution:', err)
      setError('Erro ao excluir faculdade')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (inst: Institution) => {
    if (!firebaseUser) return

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/institutions/${inst.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !inst.isActive }),
      })

      if (response.ok) {
        setInstitutions((prev) =>
          prev.map((i) =>
            i.id === inst.id ? { ...i, isActive: !i.isActive } : i
          )
        )
      }
    } catch (err) {
      console.error('Error toggling institution:', err)
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
            <Building2 className="w-6 h-6" />
            Faculdades Parceiras
          </h1>
          <p className="text-gray-500">
            Gerencie as faculdades parceiras exibidas no site
          </p>
        </div>

        <Link
          href="/admin/faculdades/nova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Faculdade
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma faculdade cadastrada</p>
          <Link
            href="/admin/faculdades/nova"
            className="inline-flex items-center gap-2 text-bolsa-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Adicionar primeira faculdade
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                !inst.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Drag Handle */}
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Logo */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {inst.logoUrl ? (
                    <Image
                      src={inst.logoUrl}
                      alt={inst.name}
                      width={56}
                      height={56}
                      className="object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = `<span class="text-xl font-bold text-gray-400">${inst.shortName.charAt(0)}</span>`
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{inst.shortName.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                    {!inst.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        Inativa
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{inst.fullName}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {typeLabels[inst.type] || inst.type}
                    </span>
                    {inst.mecRating && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3" fill="currentColor" />
                          MEC {inst.mecRating}
                        </span>
                      </>
                    )}
                    {inst.headquartersCity && inst.headquartersState && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {inst.headquartersCity}/{inst.headquartersState}
                        </span>
                      </>
                    )}
                    {inst.modalities.length > 0 && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {inst.modalities.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(inst)}
                    className={`p-2 rounded-lg transition-colors ${
                      inst.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={inst.isActive ? 'Desativar' : 'Ativar'}
                  >
                    {inst.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/admin/faculdades/${inst.id}/editar`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(inst.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === inst.id && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <p className="text-red-700 mb-3">
                    Tem certeza que deseja excluir a faculdade <strong>{inst.name}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(inst.id)}
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

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Ativas</p>
          <p className="text-2xl font-bold text-green-600">
            {institutions.filter((i) => i.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Inativas</p>
          <p className="text-2xl font-bold text-gray-400">
            {institutions.filter((i) => !i.isActive).length}
          </p>
        </div>
      </div>
    </div>
  )
}
