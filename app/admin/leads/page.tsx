'use client'

import { useEffect, useState } from 'react'
import {
  Target,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  Phone,
  Loader2,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  User,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Lead {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  courseNames: string[]
  courseId: string | null
  courseName: string | null
  institutionName: string | null
  modalidade: string | null
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'LOST'
  convertedAt: string | null
  createdAt: string
  updatedAt: string
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
  INTERESTED: {
    label: 'Interessado',
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

  const formatPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
    }
    return phone
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
              <option value="INTERESTED">Interessados</option>
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
                    {/* Contact Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contato</h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {lead.name}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {formatPhone(lead.phone)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        CPF: {lead.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                      </p>
                    </div>

                    {/* Course Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Curso</h3>
                      <div className="space-y-1">
                        {lead.courseName && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            {lead.courseName}
                          </p>
                        )}
                        {lead.institutionName && (
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {lead.institutionName}
                          </p>
                        )}
                        {lead.modalidade && (
                          <p className="text-gray-500 text-sm">
                            {lead.modalidade}
                          </p>
                        )}
                        {lead.courseNames.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Cursos de interesse:</p>
                            <div className="flex flex-wrap gap-1">
                              {lead.courseNames.map((name, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Alterar status</h3>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={updating === lead.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent disabled:opacity-50"
                      >
                        <option value="NEW">Novo</option>
                        <option value="CONTACTED">Contactado</option>
                        <option value="INTERESTED">Interessado</option>
                        <option value="CONVERTED">Convertido</option>
                        <option value="LOST">Perdido</option>
                      </select>
                      {lead.convertedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Convertido em {formatDate(lead.convertedAt)}
                        </p>
                      )}
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
