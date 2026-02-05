'use client'

import { useEffect, useState } from 'react'
import {
  Shield,
  Plus,
  Trash2,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface AdminUser {
  id: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'
  permissions: string[]
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
    firebaseUid: string
  }
}

const roleConfig = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-800',
    description: 'Acesso total ao sistema',
  },
  ADMIN: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-800',
    description: 'Gerencia conteúdo e usuários',
  },
  EDITOR: {
    label: 'Editor',
    color: 'bg-green-100 text-green-800',
    description: 'Edita conteúdo da central de ajuda e cursos',
  },
}

const availablePermissions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'help_center', label: 'Central de Ajuda' },
  { key: 'courses', label: 'Cursos' },
  { key: 'users', label: 'Usuários/Leads/Matrículas' },
  { key: 'admin_management', label: 'Gerenciar Admins' },
]

export default function AdminAdminsPage() {
  const { firebaseUser } = useAuth()
  const { role: currentRole, hasPermission } = useAdmin()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'EDITOR'>('EDITOR')
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>(['dashboard', 'help_center'])

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAdmins = async () => {
    if (!firebaseUser || !hasPermission('admin_management')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar administradores')
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
      setError('Erro ao carregar administradores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [firebaseUser, hasPermission])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setModalLoading(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newAdminEmail,
          role: newAdminRole,
          permissions: newAdminPermissions,
        }),
      })

      if (response.ok) {
        setSuccess('Administrador adicionado com sucesso!')
        setShowModal(false)
        setNewAdminEmail('')
        setNewAdminRole('EDITOR')
        setNewAdminPermissions(['dashboard', 'help_center'])
        fetchAdmins()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao adicionar administrador')
      }
    } catch (err) {
      console.error('Error adding admin:', err)
      setError('Erro ao adicionar administrador')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!firebaseUser) return

    setDeleting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccess('Administrador removido com sucesso!')
        setDeleteConfirm(null)
        fetchAdmins()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao remover administrador')
      }
    } catch (err) {
      console.error('Error deleting admin:', err)
      setError('Erro ao remover administrador')
    } finally {
      setDeleting(false)
    }
  }

  const togglePermission = (permission: string) => {
    setNewAdminPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (!hasPermission('admin_management')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        <p className="text-gray-400 text-sm mt-2">Apenas Super Admins podem gerenciar administradores.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Administradores
          </h1>
          <p className="text-gray-500">
            Gerencie os administradores do sistema
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Admin
        </button>
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

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum administrador encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {admins.map((admin) => {
              const role = roleConfig[admin.role]
              const isCurrentUser = admin.user.firebaseUid === firebaseUser?.uid

              return (
                <div key={admin.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-bolsa-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-bolsa-primary font-semibold text-lg">
                          {admin.user.name?.[0]?.toUpperCase() || admin.user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {admin.user.name || 'Sem nome'}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {admin.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center gap-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                          <Shield className="w-3 h-3" />
                          {role.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(admin.createdAt)}
                      </div>

                      {/* Delete Button */}
                      {currentRole === 'SUPER_ADMIN' && !isCurrentUser && admin.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => setDeleteConfirm(admin.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover administrador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {admin.permissions.map((permission) => {
                      const permConfig = availablePermissions.find((p) => p.key === permission)
                      return (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {permConfig?.label || permission}
                        </span>
                      )
                    })}
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === admin.id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 mb-3">
                        Tem certeza que deseja remover <strong>{admin.user.name || admin.user.email}</strong> como administrador?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
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
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Adicionar Administrador</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email do usuário
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O usuário precisa já estar cadastrado no sistema.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as 'ADMIN' | 'EDITOR')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                >
                  <option value="EDITOR">Editor - Edita conteúdo</option>
                  <option value="ADMIN">Admin - Gerencia conteúdo e usuários</option>
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões
                </label>
                <div className="space-y-2">
                  {availablePermissions
                    .filter((p) => p.key !== 'admin_management')
                    .map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newAdminPermissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="w-4 h-4 text-bolsa-primary border-gray-300 rounded focus:ring-bolsa-primary"
                        />
                        <span className="text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !newAdminEmail}
                  className="flex-1 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
