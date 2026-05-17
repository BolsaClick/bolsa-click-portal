'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Star,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'

interface Review {
  id: string
  institutionId: string
  authorName: string
  authorEmail: string
  emailVerified: boolean
  rating: number
  recommends: boolean
  body: string
  status: ReviewStatus
  response: string | null
  respondedAt: string | null
  responderEmail: string | null
  ip: string | null
  rejectReason: string | null
  createdAt: string
  institution: { name: string; slug: string }
}

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: typeof AlertCircle }> = {
  PENDING:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  APPROVED: { label: 'Aprovada',  color: 'bg-green-100 text-green-800',   icon: CheckCircle2 },
  REJECTED: { label: 'Rejeitada', color: 'bg-gray-100 text-gray-700',     icon: XCircle },
  SPAM:     { label: 'Spam',      color: 'bg-red-100 text-red-800',       icon: ShieldAlert },
}

export default function AdminReviewsPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [reviews, setReviews] = useState<Review[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('PENDING')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchReviews = useCallback(async () => {
    if (!firebaseUser || !hasPermission('reviews')) return
    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)
      const res = await fetch(`/api/admin/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setPages(data.pages)
        setCounts(data.countsByStatus || {})
      }
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, hasPermission, page, statusFilter, search])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const moderate = async (id: string, action: 'approve' | 'reject' | 'spam', rejectReason?: string) => {
    if (!firebaseUser) return
    setUpdating(id)
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, rejectReason }),
      })
      await fetchReviews()
    } finally {
      setUpdating(null)
    }
  }

  const remove = async (id: string) => {
    if (!firebaseUser) return
    if (!confirm('Apagar essa avaliação permanentemente?')) return
    setUpdating(id)
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchReviews()
    } finally {
      setUpdating(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
        />
      ))}
    </div>
  )

  if (!firebaseUser || !hasPermission('reviews')) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-600">
          Você não tem permissão para acessar esta página. Permissão necessária:{' '}
          <code className="bg-gray-100 px-1 rounded">reviews</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Avaliações</h1>
        <p className="text-sm text-gray-600">
          Moderação de reviews públicos de faculdades. Aprove o que for opinião legítima
          (positiva ou negativa) — só rejeite spam, abuso ou dados pessoais expostos.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReviewStatus | '')
              setPage(1)
            }}
            className="text-sm bg-transparent focus:outline-none"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente ({counts.PENDING ?? 0})</option>
            <option value="APPROVED">Aprovada ({counts.APPROVED ?? 0})</option>
            <option value="REJECTED">Rejeitada ({counts.REJECTED ?? 0})</option>
            <option value="SPAM">Spam ({counts.SPAM ?? 0})</option>
          </select>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(searchInput)
            setPage(1)
          }}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-md"
        >
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, email ou conteúdo"
            className="text-sm bg-transparent flex-1 focus:outline-none"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          Nenhuma avaliação encontrada com esses filtros.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const cfg = statusConfig[r.status]
            const Icon = cfg.icon
            return (
              <article
                key={r.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{r.authorName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.authorEmail} ·{' '}
                      <a
                        href={`/faculdades/${r.institution.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {r.institution.name}
                      </a>{' '}
                      · {new Date(r.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {renderStars(r.rating)}
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${r.recommends ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {r.recommends ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                    {r.recommends ? 'Recomenda' : 'Não recomenda'}
                  </span>
                </div>

                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">
                  {r.body}
                </p>

                {r.response && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                      Resposta da {r.institution.name} ({r.responderEmail}) ·{' '}
                      {r.respondedAt && new Date(r.respondedAt).toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {r.response}
                    </p>
                  </div>
                )}

                {r.rejectReason && (
                  <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Motivo da rejeição:</span> {r.rejectReason}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  {r.status !== 'APPROVED' && (
                    <button
                      onClick={() => moderate(r.id, 'approve')}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Aprovar
                    </button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Motivo da rejeição (opcional):') || ''
                        moderate(r.id, 'reject', reason)
                      }}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                    >
                      <XCircle size={14} /> Rejeitar
                    </button>
                  )}
                  {r.status !== 'SPAM' && (
                    <button
                      onClick={() => moderate(r.id, 'spam')}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50"
                    >
                      <ShieldAlert size={14} /> Marcar spam
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    disabled={updating === r.id}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-600 rounded-md disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Apagar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {page} de {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
