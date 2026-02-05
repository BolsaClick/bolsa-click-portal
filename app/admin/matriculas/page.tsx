'use client'

import { useEffect, useState } from 'react'
import {
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  MapPin,
  Loader2,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  PlayCircle,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Enrollment {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'ENROLLED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  courseName: string
  institutionName: string
  modalidade: string
  turno: string | null
  unitName: string | null
  city: string | null
  state: string | null
  originalPrice: number | null
  finalPrice: number | null
  discount: number | null
  externalId: string | null
  enrollmentDate: string | null
  startDate: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800',
    icon: PlayCircle,
  },
  ENROLLED: {
    label: 'Matriculado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Concluído',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle2,
  },
}

const paymentStatusConfig = {
  PENDING: { label: 'Aguardando', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600', bg: 'bg-blue-50' },
  PAID: { label: 'Pago', color: 'text-green-600', bg: 'bg-green-50' },
  FAILED: { label: 'Falhou', color: 'text-red-600', bg: 'bg-red-50' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600', bg: 'bg-gray-50' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-50' },
}

export default function AdminEnrollmentsPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchEnrollments = async () => {
    if (!firebaseUser || !hasPermission('users')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (statusFilter) params.append('status', statusFilter)
      if (paymentFilter) params.append('paymentStatus', paymentFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/enrollments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [firebaseUser, hasPermission, pagination.page, statusFilter, paymentFilter, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = async (enrollmentId: string, field: 'status' | 'paymentStatus', value: string) => {
    if (!firebaseUser) return

    setUpdating(enrollmentId)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: enrollmentId, [field]: value }),
      })

      if (response.ok) {
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === enrollmentId
              ? { ...enrollment, [field]: value }
              : enrollment
          )
        )
      }
    } catch (error) {
      console.error('Error updating enrollment:', error)
    } finally {
      setUpdating(null)
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

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (!hasPermission('users')) {
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
            Matrículas
          </h1>
          <p className="text-gray-500">
            {pagination.total} matrículas registradas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent appearance-none bg-white text-sm"
            >
              <option value="">Status</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="ENROLLED">Matriculado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="COMPLETED">Concluído</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent appearance-none bg-white text-sm"
            >
              <option value="">Pagamento</option>
              <option value="PENDING">Aguardando</option>
              <option value="PROCESSING">Processando</option>
              <option value="PAID">Pago</option>
              <option value="FAILED">Falhou</option>
              <option value="REFUNDED">Reembolsado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent w-full md:w-48"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma matrícula encontrada</p>
          </div>
        ) : (
          enrollments.map((enrollment) => {
            const status = statusConfig[enrollment.status]
            const StatusIcon = status.icon
            const paymentStatus = paymentStatusConfig[enrollment.paymentStatus]

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Status Header */}
                <div className={`px-4 py-2 ${status.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                    {enrollment.externalId && (
                      <span className="text-xs opacity-75 ml-2">
                        ID: {enrollment.externalId}
                      </span>
                    )}
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatus.bg} ${paymentStatus.color}`}>
                    {paymentStatus.label}
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Aluno</h3>
                      <p className="text-gray-600">{enrollment.user.name || 'Sem nome'}</p>
                      <p className="text-gray-500 text-sm">{enrollment.user.email}</p>
                      {enrollment.user.phone && (
                        <p className="text-gray-500 text-sm">{enrollment.user.phone}</p>
                      )}
                    </div>

                    {/* Course Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Curso</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{enrollment.courseName}</span>
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Building2 className="w-3 h-3 flex-shrink-0" />
                          {enrollment.institutionName}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {enrollment.modalidade}
                          {enrollment.turno && enrollment.turno !== 'VIRTUAL' && ` - ${enrollment.turno}`}
                        </p>
                        {(enrollment.city || enrollment.state) && (
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {[enrollment.city, enrollment.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates & Price */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Criado: {formatDate(enrollment.createdAt)}
                        </p>
                        {enrollment.enrollmentDate && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            Matrícula: {formatDate(enrollment.enrollmentDate)}
                          </p>
                        )}
                        {enrollment.startDate && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <PlayCircle className="w-4 h-4 text-gray-400" />
                            Início: {formatDate(enrollment.startDate)}
                          </p>
                        )}
                        {enrollment.finalPrice && (
                          <div className="mt-2">
                            {enrollment.originalPrice && enrollment.originalPrice > enrollment.finalPrice && (
                              <p className="text-gray-400 line-through text-xs">
                                {formatCurrency(enrollment.originalPrice)}
                              </p>
                            )}
                            <p className="text-green-600 font-semibold">
                              {formatCurrency(enrollment.finalPrice)}/mês
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Controls */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Gerenciar</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Status
                          </label>
                          <select
                            value={enrollment.status}
                            onChange={(e) => handleStatusChange(enrollment.id, 'status', e.target.value)}
                            disabled={updating === enrollment.id}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent disabled:opacity-50"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="IN_PROGRESS">Em Andamento</option>
                            <option value="ENROLLED">Matriculado</option>
                            <option value="CANCELLED">Cancelado</option>
                            <option value="COMPLETED">Concluído</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Pagamento
                          </label>
                          <select
                            value={enrollment.paymentStatus}
                            onChange={(e) => handleStatusChange(enrollment.id, 'paymentStatus', e.target.value)}
                            disabled={updating === enrollment.id}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent disabled:opacity-50"
                          >
                            <option value="PENDING">Aguardando</option>
                            <option value="PROCESSING">Processando</option>
                            <option value="PAID">Pago</option>
                            <option value="FAILED">Falhou</option>
                            <option value="REFUNDED">Reembolsado</option>
                            <option value="CANCELLED">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
