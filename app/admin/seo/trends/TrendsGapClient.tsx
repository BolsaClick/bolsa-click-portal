'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, MinusCircle, X } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

type MatchStatus = 'GAP' | 'PARTIAL' | 'COVERED'
type TrendsSource = 'CURATED' | 'COURSE_CATALOG' | 'INSTITUTION_CATALOG'

interface Entry {
  id: string
  query: string
  normalizedQuery: string
  trendValue: number
  isRising: boolean
  risingPercent: number | null
  matchStatus: MatchStatus
  matchedEntities: string[]
  priorityScore: number
  dismissed: boolean
  snapshot: {
    topic: string
    source: TrendsSource
    timeframe: string
    fetchedAt: string
  }
}

interface ApiResponse {
  entries: Entry[]
  counts: Partial<Record<MatchStatus, number>>
  lastFetchedAt: string | null
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  GAP: 'Gap',
  PARTIAL: 'Parcial',
  COVERED: 'Coberto',
}

const STATUS_BADGE: Record<MatchStatus, string> = {
  GAP: 'bg-rose-100 text-rose-800 border-rose-200',
  PARTIAL: 'bg-amber-100 text-amber-800 border-amber-200',
  COVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const SOURCE_LABEL: Record<TrendsSource, string> = {
  CURATED: 'Watchlist',
  COURSE_CATALOG: 'Curso',
  INSTITUTION_CATALOG: 'Faculdade',
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

export default function TrendsGapClient() {
  const { firebaseUser } = useAuth()
  const { hasPermission, loading: adminLoading } = useAdmin()

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<MatchStatus | ''>('')
  const [sourceFilter, setSourceFilter] = useState<TrendsSource | ''>('')
  const [onlyRising, setOnlyRising] = useState(false)

  const fetchEntries = useCallback(async () => {
    if (!firebaseUser) return
    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const params = new URLSearchParams({ limit: '200' })
      if (statusFilter) params.append('status', statusFilter)
      if (sourceFilter) params.append('source', sourceFilter)
      if (onlyRising) params.append('onlyRising', 'true')
      const res = await fetch(`/api/admin/seo/trends/entries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const json = (await res.json()) as ApiResponse
        setData(json)
      } else if (res.status === 403) {
        setRefreshMsg('Sem permissão SEO.')
      }
    } catch {
      setRefreshMsg('Erro carregando entries.')
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, statusFilter, sourceFilter, onlyRising])

  useEffect(() => {
    if (firebaseUser && hasPermission('seo')) fetchEntries()
  }, [firebaseUser, hasPermission, fetchEntries])

  async function handleRefresh() {
    if (!firebaseUser || refreshing) return
    setRefreshing(true)
    setRefreshMsg(null)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/seo/trends/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok) {
        setRefreshMsg(`✓ ${json.topicsProcessed} topics processados, ${json.totalEntries} entries.${json.rateLimited ? ' Atenção: Google rate-limited durante o refresh.' : ''}`)
        await fetchEntries()
      } else if (res.status === 429) {
        setRefreshMsg(`⏱ ${json.message ?? 'Aguarde antes do próximo refresh.'}`)
      } else {
        setRefreshMsg(`Erro: ${json.error ?? 'desconhecido'}`)
      }
    } catch (e) {
      setRefreshMsg(`Erro: ${e instanceof Error ? e.message : 'falha'}`)
    } finally {
      setRefreshing(false)
    }
  }

  async function handleDismiss(id: string) {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/seo/trends/${id}/dismiss`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      })
      await fetchEntries()
    } catch {
      setRefreshMsg('Erro ao dismissar entry.')
    }
  }

  const kpis = useMemo(() => {
    const gap = data?.counts.GAP ?? 0
    const partial = data?.counts.PARTIAL ?? 0
    const covered = data?.counts.COVERED ?? 0
    const rising = data?.entries.filter((e) => e.isRising).length ?? 0
    return { gap, partial, covered, rising, total: gap + partial + covered }
  }, [data])

  if (adminLoading) return <div className="p-8 text-ink-500">Carregando…</div>

  if (!hasPermission('seo')) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl text-ink-900">Acesso negado</h1>
        <p className="mt-2 text-ink-700">Você não tem permissão <code>seo</code>.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-2">
          <div>
            <nav className="text-xs text-ink-500 mb-1">
              <Link href="/admin/seo" className="hover:text-ink-900">SEO</Link> / Trends
            </nav>
            <h1 className="font-display text-3xl md:text-4xl text-ink-900">Trends & Gap Analysis</h1>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-ink-900 bg-ink-900 px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white hover:bg-bolsa-secondary hover:border-bolsa-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Atualizando…' : 'Atualizar agora'}
          </button>
        </div>
        <p className="text-sm text-ink-500 mb-6">
          Última atualização: {timeAgo(data?.lastFetchedAt ?? null)}
          {data?.lastFetchedAt && ` · ${new Date(data.lastFetchedAt).toLocaleString('pt-BR')}`}
        </p>

        {refreshMsg && (
          <div className="mb-6 border border-hairline bg-paper px-4 py-3 text-sm text-ink-700">
            {refreshMsg}
          </div>
        )}

        {/* KPIs */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline mb-6">
          <div className="bg-white px-5 py-4">
            <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-rose-600">Gaps</dt>
            <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{kpis.gap}</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-amber-600">Parcial</dt>
            <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{kpis.partial}</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-emerald-600">Cobertos</dt>
            <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{kpis.covered}</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">Em alta (rising)</dt>
            <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{kpis.rising}</dd>
          </div>
        </dl>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MatchStatus | '')}
            className="border border-hairline bg-white px-3 py-1.5 text-sm text-ink-900"
          >
            <option value="">Todos status</option>
            <option value="GAP">Gap</option>
            <option value="PARTIAL">Parcial</option>
            <option value="COVERED">Coberto</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as TrendsSource | '')}
            className="border border-hairline bg-white px-3 py-1.5 text-sm text-ink-900"
          >
            <option value="">Todas fontes</option>
            <option value="CURATED">Watchlist</option>
            <option value="COURSE_CATALOG">Curso</option>
            <option value="INSTITUTION_CATALOG">Faculdade</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={onlyRising}
              onChange={(e) => setOnlyRising(e.target.checked)}
              className="border-hairline"
            />
            Só em alta
          </label>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper">
              <tr className="border-b border-hairline">
                <th className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Query</th>
                <th className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Topic</th>
                <th className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Score</th>
                <th className="text-center py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Status</th>
                <th className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Match</th>
                <th className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-ink-500">Carregando entries…</td></tr>
              ) : !data?.entries.length ? (
                <tr><td colSpan={6} className="text-center py-10 text-ink-500">
                  Nenhuma entry. Clique &ldquo;Atualizar agora&rdquo; pra rodar o primeiro snapshot.
                </td></tr>
              ) : (
                data.entries.map((e) => (
                  <tr key={e.id} className="border-b border-hairline/60 hover:bg-paper">
                    <td className="py-3 px-3 text-ink-900">
                      <div className="flex items-center gap-2">
                        {e.isRising && <TrendingUp size={12} className="text-emerald-600" />}
                        <span>{e.query}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-ink-700 text-xs">
                      <span className="font-mono uppercase text-[10px] text-ink-500 mr-1">{SOURCE_LABEL[e.snapshot.source]}</span>
                      {e.snapshot.topic}
                    </td>
                    <td className="py-3 px-3 text-right num-tabular text-ink-900 font-display">{e.priorityScore.toFixed(1)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${STATUS_BADGE[e.matchStatus]}`}>
                        {e.matchStatus === 'GAP' && <AlertTriangle size={10} />}
                        {e.matchStatus === 'PARTIAL' && <MinusCircle size={10} />}
                        {e.matchStatus === 'COVERED' && <CheckCircle2 size={10} />}
                        {STATUS_LABEL[e.matchStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-ink-500">
                      {e.matchedEntities.length === 0 ? '—' : (
                        <div className="flex flex-wrap gap-1">
                          {e.matchedEntities.slice(0, 2).map((m) => (
                            <span key={m} className="font-mono text-[10px] bg-paper border border-hairline px-1.5 py-0.5">
                              {m}
                            </span>
                          ))}
                          {e.matchedEntities.length > 2 && (
                            <span className="font-mono text-[10px] text-ink-500">+{e.matchedEntities.length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDismiss(e.id)}
                        className="text-ink-500 hover:text-rose-600 transition-colors"
                        title="Dispensar entry"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
