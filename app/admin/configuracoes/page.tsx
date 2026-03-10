'use client'

import { useEffect, useState } from 'react'
import {
  Settings,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Save,
  Loader2,
  MessageCircle,
  FileText,
  Image,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'
import { toast } from 'sonner'

interface SiteSettings {
  whatsappNumber: string
  contactEmail: string
  contactPhone: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  siteName: string
  siteDescription: string
  logoUrl: string
}

export default function AdminConfiguracoesPage() {
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SiteSettings>({
    whatsappNumber: '',
    contactEmail: '',
    contactPhone: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    siteName: '',
    siteDescription: '',
    logoUrl: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      if (!firebaseUser) return
      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setFormData(data.settings)
        } else {
          toast.error('Erro ao carregar configurações')
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [firebaseUser])

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!firebaseUser) return
    setSaving(true)
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (!hasPermission('admin_management')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sem permissão para acessar esta página</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" /> Configurações
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as configurações gerais do site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar
        </button>
      </div>

      <div className="space-y-6">
        {/* Contato */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-green-600" />
            Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Número do WhatsApp
                </div>
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="5511936200198"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Formato: código do país + DDD + número (ex: 5511936200198)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email de Contato
                </div>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="contato@bolsaclick.com.br"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Telefone de Contato
                </div>
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="(11) 93620-0198"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            Redes Sociais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </div>
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/bolsaclickbrasil"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </div>
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/bolsaclick"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </div>
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/bolsaclick"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-600" />
            SEO e Identidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Site
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="Bolsa Click"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-gray-500" />
                  URL do Logo
                </div>
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="/assets/logo-bolsa-click-rosa.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Site
              </label>
              <textarea
                value={formData.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="O maior marketplace de bolsas de estudo do Brasil"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão salvar fixo no mobile */}
      <div className="mt-6 md:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-3 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Configurações
        </button>
      </div>
    </div>
  )
}
