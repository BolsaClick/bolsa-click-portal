'use client'

import { useEffect, useState } from 'react'
import {
  Target,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  MapPin,
  Phone,
  Loader2,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Lead {
  id: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
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
  contactPhone: string | null
  contactEmail: string | null
  notes: string | null
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
  NEW: {
    label: 'Novo',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  CONTACTED: {
    label: 'Contactado',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Phone,
  },
  QUALIFIED: {
    label: 'Qualificado',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle2,
  },
  CONVERTED: {
    label: 'Convertido',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  LOST: {
    label: 'Perdido',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
}

export default function AdminLeadsPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchLeads = async () => {
    if (!firebaseUser || !hasPermission('users')) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [firebaseUser, hasPermission, pagination.page, statusFilter, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!firebaseUser) return

    setUpdating(leadId)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      })

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId
              ? { ...lead, status: newStatus as Lead['status'] }
              : lead
          )
        )
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <Target className="w-6 h-6" />
            Leads
          </h1>
          <p className="text-gray-500">
            {pagination.total} leads cadastrados
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="">Todos os status</option>
              <option value="NEW">Novos</option>
              <option value="CONTACTED">Contactados</option>
              <option value="QUALIFIED">Qualificados</option>
              <option value="CONVERTED">Convertidos</option>
              <option value="LOST">Perdidos</option>
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
                placeholder="Buscar por email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent w-full md:w-64"
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
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum lead encontrado</p>
          </div>
        ) : (
          leads.map((lead) => {
            const status = statusConfig[lead.status]
            const StatusIcon = status.icon

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Status Header */}
                <div className={`px-4 py-2 ${status.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatDate(lead.createdAt)}
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Usuário</h3>
                      <p className="text-gray-600">{lead.user.name || 'Sem nome'}</p>
                      <p className="text-gray-500 text-sm">{lead.user.email}</p>
                      {lead.user.phone && (
                        <p className="text-gray-500 text-sm">{lead.user.phone}</p>
                      )}
                      {lead.contactPhone && lead.contactPhone !== lead.user.phone && (
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.contactPhone}
                        </p>
                      )}
                    </div>

                    {/* Course Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Curso</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          {lead.courseName}
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {lead.institutionName}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {lead.modalidade}
                          {lead.turno && lead.turno !== 'VIRTUAL' && ` - ${lead.turno}`}
                        </p>
                        {(lead.city || lead.state) && (
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[lead.city, lead.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Valor</h3>
                      {lead.finalPrice && (
                        <div className="mb-3">
                          {lead.originalPrice && lead.originalPrice > lead.finalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              {formatCurrency(lead.originalPrice)}
                            </p>
                          )}
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(lead.finalPrice)}
                            <span className="text-sm font-normal text-gray-500">/mês</span>
                          </p>
                          {lead.discount && lead.discount > 0 && (
                            <p className="text-sm text-green-600">
                              Desconto de {formatCurrency(lead.discount)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Status Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alterar status
                        </label>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={updating === lead.id}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent disabled:opacity-50"
                        >
                          <option value="NEW">Novo</option>
                          <option value="CONTACTED">Contactado</option>
                          <option value="QUALIFIED">Qualificado</option>
                          <option value="CONVERTED">Convertido</option>
                          <option value="LOST">Perdido</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Observações:</span> {lead.notes}
                      </p>
                    </div>
                  )}
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
