'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Instagram,
  Plus,
  Loader2,
  CheckCircle2,
  Undo2,
  Trash2,
  Calendar,
  AlertTriangle,
  RotateCw,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

/**
 * Fila de publicação do Instagram.
 *
 * A tela mostra o SLIDE RENDERIZADO, não os campos: aprovar carrossel lendo
 * JSON não é aprovar. Cada card desenha as três imagens direto de
 * `/api/og/social/[formato]?postId=...`, que lê os slides CONGELADOS da peça,
 * então o que aparece aqui é exatamente o que vai pro feed.
 *
 * `unoptimized` no `next/image` de propósito: a rota devolve PNG gerado na
 * hora, e passar pelo otimizador só adicionaria um cache no meio capaz de
 * mostrar uma versão velha da peça justamente na tela onde isso não pode
 * acontecer.
 */

type Status = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'FAILED'

interface SocialPost {
  id: string
  format: string
  status: Status
  scheduledFor: string | null
  caption: string
  hashtags: string[]
  ctaUrl: string | null
  sourceRef: string | null
  approvedAt: string | null
  publishedAt: string | null
  failureReason: string | null
  createdAt: string
}

const SLIDES = ['capa', 'conteudo', 'cta'] as const

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: 'Rascunho',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
  FAILED: 'Falhou',
}

const STATUS_CLASSE: Record<Status, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
}

const FILTROS: { value: string; label: string }[] = [
  { value: '', label: 'Tudo' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'PUBLISHED', label: 'Publicados' },
  { value: 'FAILED', label: 'Falhas' },
]

export default function AdminSocialPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [agindo, setAgindo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [statusFiltro, setStatusFiltro] = useState('')

  const podeEditar = hasPermission('blog')

  const authFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      if (!firebaseUser) throw new Error('sem sessão')
      const token = await firebaseUser.getIdToken()
      return fetch(url, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    },
    [firebaseUser],
  )

  const carregar = useCallback(async () => {
    if (!firebaseUser) return
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '12' })
      if (statusFiltro) params.set('status', statusFiltro)
      const res = await authFetch(`/api/admin/social/posts?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao carregar a fila')
      setPosts(data.posts)
      setErro(null)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar a fila')
    } finally {
      setLoading(false)
    }
  }, [authFetch, firebaseUser, statusFiltro])

  useEffect(() => {
    carregar()
  }, [carregar])

  const gerarProxima = async () => {
    try {
      setGerando(true)
      setErro(null)
      const res = await authFetch('/api/admin/social/posts', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const data = await res.json()
      // Sem oferta real a API não cria rascunho nenhum, e o motivo aparece
      // aqui: fila vazia é melhor que rascunho com preço inventado.
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao gerar')
    } finally {
      setGerando(false)
    }
  }

  const mudarStatus = async (id: string, status: Status) => {
    try {
      setAgindo(id)
      setErro(null)
      const res = await authFetch(`/api/admin/social/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao mudar o status')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao mudar o status')
    } finally {
      setAgindo(null)
    }
  }

  const apagar = async (id: string) => {
    try {
      setAgindo(id)
      setErro(null)
      const res = await authFetch(`/api/admin/social/posts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao apagar')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao apagar')
    } finally {
      setAgindo(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Instagram className="h-6 w-6 text-pink-500" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Instagram</h1>
            <p className="text-sm text-slate-500">
              Nada vai ao ar sem aprovação. Confira o carrossel renderizado antes de aprovar.
            </p>
          </div>
        </div>
        {podeEditar && (
          <button
            onClick={gerarProxima}
            disabled={gerando}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Gerar próxima oferta
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFiltro(f.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              statusFiltro === f.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={carregar}
          className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando a fila...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Nada na fila com esse filtro.
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <header className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSE[post.status]}`}
                >
                  {STATUS_LABEL[post.status]}
                </span>
                <span className="text-xs text-slate-500">{post.format}</span>
                {post.sourceRef && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {post.sourceRef}
                  </span>
                )}
                {post.scheduledFor && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.scheduledFor).toLocaleString('pt-BR')}
                  </span>
                )}
              </header>

              {/* A peça, renderizada. É isto que se aprova, não o JSON. */}
              <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
                {SLIDES.map((slide) => (
                  <div key={slide} className="shrink-0">
                    <Image
                      src={`/api/og/social/oferta?postId=${post.id}&slide=${slide}`}
                      alt={`Slide ${slide} da peça ${post.id}`}
                      width={1080}
                      height={1350}
                      unoptimized
                      className="h-[420px] w-auto rounded-lg border border-slate-200"
                    />
                    <p className="mt-1 text-center text-xs uppercase tracking-wide text-slate-400">
                      {slide}
                    </p>
                  </div>
                ))}
              </div>

              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-600">
                  Legenda e hashtags
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm text-slate-700">
                  {post.caption}
                </pre>
                <p className="mt-2 text-sm text-slate-500">{post.hashtags.join(' ')}</p>
                {post.ctaUrl && (
                  <p className="mt-2 break-all font-mono text-xs text-slate-500">{post.ctaUrl}</p>
                )}
              </details>

              {post.failureReason && (
                <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
                  {post.failureReason}
                </p>
              )}

              {podeEditar && (
                <footer className="flex flex-wrap gap-2">
                  {post.status === 'DRAFT' && (
                    <button
                      onClick={() => mudarStatus(post.id, 'APPROVED')}
                      disabled={agindo === post.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {agindo === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Aprovar
                    </button>
                  )}
                  {post.status === 'APPROVED' && (
                    <button
                      onClick={() => mudarStatus(post.id, 'DRAFT')}
                      disabled={agindo === post.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
                    >
                      <Undo2 className="h-4 w-4" />
                      Voltar pra rascunho
                    </button>
                  )}
                  {post.status !== 'PUBLISHED' && (
                    <button
                      onClick={() => apagar(post.id)}
                      disabled={agindo === post.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Descartar
                    </button>
                  )}
                </footer>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
