'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Power, Trash2, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Responder {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}

interface Institution {
  id: string
  name: string
  slug: string
}

export default function ResponderEmailsPage() {
  const params = useParams()
  const id = params.id as string
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [responders, setResponders] = useState<Responder[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchResponders = useCallback(async () => {
    if (!firebaseUser || !hasPermission('reviews')) return
    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/institutions/${id}/responders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setInstitution(data.institution)
        setResponders(data.responders)
      }
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, hasPermission, id])

  useEffect(() => {
    fetchResponders()
  }, [fetchResponders])

  const addResponder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser || !newEmail) return
    setAdding(true)
    setError(null)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/institutions/${id}/responders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erro ao adicionar')
      } else {
        setNewEmail('')
        await fetchResponders()
      }
    } finally {
      setAdding(false)
    }
  }

  const toggleActive = async (rId: string, isActive: boolean) => {
    if (!firebaseUser) return
    const token = await firebaseUser.getIdToken()
    await fetch(`/api/admin/institutions/${id}/responders/${rId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !isActive }),
    })
    await fetchResponders()
  }

  const remove = async (rId: string) => {
    if (!firebaseUser) return
    if (!confirm('Remover este email autorizado?')) return
    const token = await firebaseUser.getIdToken()
    await fetch(`/api/admin/institutions/${id}/responders/${rId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetchResponders()
  }

  if (!firebaseUser || !hasPermission('reviews')) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-600">
          Permissão necessária: <code className="bg-gray-100 px-1 rounded">reviews</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href={`/admin/faculdades/${id}/editar`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={14} /> Voltar para edição da faculdade
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Emails autorizados a responder
        </h1>
        {institution && (
          <p className="text-sm text-gray-600">
            {institution.name} · Quem aparecer aqui pode responder reviews públicos da
            faculdade via magic link enviado por email.
          </p>
        )}
      </div>

      <form
        onSubmit={addResponder}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-3"
      >
        <Mail size={16} className="text-gray-400" />
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email@faculdade.com.br"
          className="flex-1 text-sm focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={adding || !newEmail}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-bolsa-secondary hover:opacity-90 rounded-md disabled:opacity-50"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </button>
      </form>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md p-3 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : responders.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Nenhum email autorizado ainda. Adicione acima para permitir que a faculdade
          responda reviews.
        </div>
      ) : (
        <ul className="space-y-2">
          {responders.map((r) => (
            <li
              key={r.id}
              className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Mail size={14} className={r.isActive ? 'text-green-600' : 'text-gray-400'} />
                <span className={`text-sm truncate ${r.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {r.email}
                </span>
                {!r.isActive && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    inativo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(r.id, r.isActive)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
                  title={r.isActive ? 'Desativar' : 'Reativar'}
                >
                  <Power size={12} />
                  {r.isActive ? 'Desativar' : 'Reativar'}
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Remover"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
