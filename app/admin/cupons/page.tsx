'use client'

import { useEffect, useState } from 'react'
import {
  Ticket,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Loader2,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  description?: string
  discount: number
  type: 'PERCENT' | 'FIXED'
  maxUses?: number
  usedCount?: number
  validFrom?: string
  validUntil?: string
  isActive?: boolean
  createdAt?: string
}

interface CouponFormData {
  code: string
  description: string
  discount: number
  type: 'PERCENT' | 'FIXED'
  maxUses: number | null
  validUntil: string
}

export default function AdminCouponsPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discount: 10,
    type: 'PERCENT',
    maxUses: null,
    validUntil: '',
  })

  const limit = 20
  const filteredCoupons = search
    ? coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))
    : coupons
  const totalPages = Math.ceil(filteredCoupons.length / limit)
  const paginatedCoupons = filteredCoupons.slice((page - 1) * limit, page * limit)

  const fetchCoupons = async () => {
    if (!firebaseUser) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()

      const response = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons || [])
      } else {
        toast.error('Erro ao carregar cupons do Elysium')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem expiração'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      description: '',
      discount: 10,
      type: 'PERCENT',
      maxUses: null,
      validUntil: '',
    })
    setShowModal(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount: coupon.discount,
      type: coupon.type,
      maxUses: coupon.maxUses || null,
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setSubmitting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil + 'T23:59:59Z').toISOString() : null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingCoupon ? 'Cupom atualizado no Elysium!' : 'Cupom criado no Elysium!')
        setShowModal(false)
        fetchCoupons()
      } else {
        toast.error(data.error || 'Erro ao salvar cupom')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast.error('Erro ao salvar cupom')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!firebaseUser) return
    if (!confirm(`Deseja realmente DELETAR o cupom ${coupon.code}?\n\nEsta ação não pode ser desfeita.`)) return

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Cupom deletado do Elysium!')
        fetchCoupons()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar cupom')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Erro ao deletar cupom')
    }
  }

  if (!hasPermission('dashboard')) {
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
            <Ticket className="w-6 h-6" />
            Cupons de Desconto
          </h1>
          <p className="text-gray-500">
            {coupons.length} cupons no Elysium
          </p>
        </div>

        <div className="flex gap-2">
          {/* Refresh */}
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por código..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent w-full md:w-60"
              />
            </div>
          </form>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Cupom
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
          </div>
        ) : paginatedCoupons.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cupom encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desconto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                          {coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {coupon.type === 'PERCENT' ? (
                          <>
                            <Percent className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-blue-600">{coupon.discount}%</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">{formatCurrency(coupon.discount)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-900">
                        {coupon.usedCount || 0}
                        {coupon.maxUses && <span className="text-gray-400">/{coupon.maxUses}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(coupon.validUntil)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-gray-500 hover:text-bolsa-primary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SUMMER2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent font-mono uppercase"
                  required
                  disabled={!!editingCoupon}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Desconto de verão"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Desconto *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENT' | 'FIXED' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  >
                    <option value="PERCENT">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor do Desconto *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {formData.type === 'PERCENT' ? '%' : 'R$'}
                    </span>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      min={0}
                      max={formData.type === 'PERCENT' ? 100 : undefined}
                      step={formData.type === 'FIXED' ? 0.01 : 1}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Usos
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                    min={1}
                    placeholder="Ilimitado"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido Até
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  />
                </div>
              </div>

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
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon ? 'Salvar' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
