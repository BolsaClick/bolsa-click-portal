'use client'

import { useEffect, useState, useRef } from 'react'
import {
  ImageIcon,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  X,
  Link as LinkIcon,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BannerForm {
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
}

const emptyForm: BannerForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true,
}

export default function AdminBannersPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()

  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BannerForm>(emptyForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchBanners = async () => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBanners(data.banners)
      }
    } catch {
      setError('Erro ao carregar banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser) return

    setUploading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        const token = await firebaseUser.getIdToken()
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            folder: 'banners',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setForm((prev) => ({ ...prev, imageUrl: data.url }))
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Erro ao fazer upload da imagem')
        }
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch {
      setError('Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    if (!form.title || !form.imageUrl) {
      setError('Título e imagem são obrigatórios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const url = editingId
        ? `/api/admin/banners/${editingId}`
        : '/api/admin/banners'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl || null,
          isActive: form.isActive,
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
        await fetchBanners()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar banner')
      }
    } catch {
      setError('Erro ao salvar banner')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      isActive: banner.isActive,
    })
    setShowForm(true)
    setError(null)
  }

  const handleDelete = async (id: string) => {
    if (!firebaseUser || !confirm('Tem certeza que deseja excluir este banner?')) return

    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await fetchBanners()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir banner')
      }
    } catch {
      setError('Erro ao excluir banner')
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    if (!firebaseUser) return

    try {
      const token = await firebaseUser.getIdToken()
      await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })
      await fetchBanners()
    } catch {
      setError('Erro ao atualizar status')
    }
  }

  const handleReorder = async (bannerId: string, direction: 'up' | 'down') => {
    if (!firebaseUser) return

    const index = banners.findIndex((b) => b.id === bannerId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    )
      return

    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const currentBanner = banners[index]
    const swapBanner = banners[swapIndex]

    try {
      const token = await firebaseUser.getIdToken()
      await Promise.all([
        fetch(`/api/admin/banners/${currentBanner.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order: swapBanner.order }),
        }),
        fetch(`/api/admin/banners/${swapBanner.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order: currentBanner.order }),
        }),
      ])
      await fetchBanners()
    } catch {
      setError('Erro ao reordenar banners')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-bolsa-primary" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Banners</h2>
            <p className="text-sm text-gray-500">
              Gerencie os banners do slider da homepage
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setForm(emptyForm)
            setShowForm(true)
            setError(null)
          }}
          className="flex items-center gap-2 bg-bolsa-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
          Novo Banner
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm(emptyForm)
                }}
              >
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="Ex: Administração com 85% OFF"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="Ex: na Faculdade Anhanguera"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem *
                </label>
                {form.imageUrl ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={form.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, imageUrl: '' }))
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-bolsa-primary transition"
                  >
                    {uploading ? (
                      <Loader2 size={32} className="text-bolsa-primary animate-spin" />
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Clique para fazer upload
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, GIF ou WebP (recomendado: 1920x600)
                        </p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <LinkIcon size={14} />
                    Link (opcional)
                  </span>
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, linkUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bolsa-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolsa-primary"></div>
                </label>
                <span className="text-sm text-gray-700">Ativo</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-bolsa-primary animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum banner cadastrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Crie seu primeiro banner para exibir no slider da homepage
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                !banner.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Preview */}
              <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {banner.title}
                  </h3>
                  {!banner.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
                {banner.subtitle && (
                  <p className="text-sm text-gray-500 truncate">
                    {banner.subtitle}
                  </p>
                )}
                {banner.linkUrl && (
                  <p className="text-xs text-blue-500 truncate mt-1">
                    {banner.linkUrl}
                  </p>
                )}
              </div>

              {/* Order buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder(banner.id, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para cima"
                >
                  <ArrowUp size={16} className="text-gray-500" />
                </button>
                <button
                  onClick={() => handleReorder(banner.id, 'down')}
                  disabled={index === banners.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para baixo"
                >
                  <ArrowDown size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title={banner.isActive ? 'Desativar' : 'Ativar'}
                >
                  {banner.isActive ? (
                    <Eye size={18} className="text-green-600" />
                  ) : (
                    <EyeOff size={18} className="text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Editar"
                >
                  <Pencil size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Excluir"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
