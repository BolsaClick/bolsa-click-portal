'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Upload,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const MODALITY_OPTIONS = ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL']
const LEVEL_OPTIONS = ['GRADUACAO', 'POS_GRADUACAO']
const TYPE_OPTIONS = [
  { value: 'PRIVADA', label: 'Privada' },
  { value: 'PUBLICA_FEDERAL', label: 'Pública Federal' },
  { value: 'PUBLICA_ESTADUAL', label: 'Pública Estadual' },
]

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export default function NovaFaculdadePage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortName: '',
    fullName: '',
    description: '',
    longDescription: '',
    founded: '',
    type: 'PRIVADA',
    campusCount: '',
    studentCount: '',
    coursesOffered: '',
    headquartersCity: '',
    headquartersState: '',
    mecRating: '',
    emecLink: '',
    modalities: [] as string[],
    academicLevels: [] as string[],
    highlights: [] as string[],
    logoUrl: '',
    imageUrl: '',
    imageAlt: '',
    keywords: [] as string[],
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  })

  const [newHighlight, setNewHighlight] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
      shortName: name.toUpperCase(),
    }))
  }

  const toggleArrayItem = (field: 'modalities' | 'academicLevels', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setForm((prev) => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }))
      setNewHighlight('')
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setForm((prev) => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }))
      setNewKeyword('')
    }
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'imageUrl'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser) return

    const setUploading = field === 'logoUrl' ? setUploadingLogo : setUploadingImage
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
            folder: 'institutions',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setForm((prev) => ({ ...prev, [field]: data.url }))
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Erro ao fazer upload da imagem')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setSaving(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        router.push('/admin/faculdades')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar faculdade')
      }
    } catch (err) {
      console.error('Error creating institution:', err)
      setError('Erro ao criar faculdade')
    } finally {
      setSaving(false)
    }
  }

  if (!hasPermission('courses')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/faculdades"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Nova Faculdade
          </h1>
          <p className="text-gray-500">Adicionar uma nova faculdade parceira</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="Ex: Anhanguera"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Curto *</label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => setForm((prev) => ({ ...prev, shortName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="Ex: ANHANGUERA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="Ex: Universidade Anhanguera"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Fundação</label>
              <input
                type="number"
                value={form.founded}
                onChange={(e) => setForm((prev) => ({ ...prev, founded: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="Ex: 1994"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              placeholder="Descrição breve da instituição..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Completa</label>
            <textarea
              value={form.longDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, longDescription: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              placeholder="Descrição detalhada da instituição (use parágrafos separados por linha vazia)..."
            />
          </div>
        </div>

        {/* Dados Acadêmicos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Acadêmicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota MEC (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.mecRating}
                onChange={(e) => setForm((prev) => ({ ...prev, mecRating: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link e-MEC</label>
              <input
                type="url"
                value={form.emecLink}
                onChange={(e) => setForm((prev) => ({ ...prev, emecLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="https://emec.mec.gov.br/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Polos/Campus</label>
              <input
                type="number"
                value={form.campusCount}
                onChange={(e) => setForm((prev) => ({ ...prev, campusCount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Alunos</label>
              <input
                type="text"
                value={form.studentCount}
                onChange={(e) => setForm((prev) => ({ ...prev, studentCount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                placeholder="Ex: 500.000+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Cursos Oferecidos</label>
              <input
                type="number"
                value={form.coursesOffered}
                onChange={(e) => setForm((prev) => ({ ...prev, coursesOffered: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
          </div>

          {/* Modalidades */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Modalidades</label>
            <div className="flex flex-wrap gap-2">
              {MODALITY_OPTIONS.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleArrayItem('modalities', mod)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.modalities.includes(mod)
                      ? 'bg-bolsa-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Níveis */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Níveis de Ensino</label>
            <div className="flex flex-wrap gap-2">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleArrayItem('academicLevels', level)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.academicLevels.includes(level)
                      ? 'bg-bolsa-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level === 'GRADUACAO' ? 'Graduação' : 'Pós-Graduação'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Localização da Sede</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={form.headquartersCity}
                onChange={(e) => setForm((prev) => ({ ...prev, headquartersCity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.headquartersState}
                onChange={(e) => setForm((prev) => ({ ...prev, headquartersState: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              >
                <option value="">Selecione</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Imagens */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens</h2>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'logoUrl')}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'imageUrl')}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              {form.logoUrl ? (
                <div className="relative inline-block">
                  <div className="w-40 h-28 rounded-lg bg-gray-50 overflow-hidden">
                    <Image
                      src={form.logoUrl}
                      alt="Logo preview"
                      width={160}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {uploadingLogo ? 'Enviando...' : 'Upload do logo'}
                  </p>
                </button>
              )}
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>
              {form.imageUrl ? (
                <div className="relative inline-block">
                  <div className="w-48 h-28 rounded-lg overflow-hidden">
                    <Image
                      src={form.imageUrl}
                      alt="Image preview"
                      width={192}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {uploadingImage ? 'Enviando...' : 'Upload da imagem de capa'}
                  </p>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto Alt da Imagem</label>
            <input
              type="text"
              value={form.imageAlt}
              onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
            />
          </div>
        </div>

        {/* Diferenciais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diferenciais</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              placeholder="Adicionar diferencial..."
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.highlights.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {h}
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-primary/50 focus:border-bolsa-primary"
                  placeholder="Adicionar keyword..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.keywords.map((k, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {k}
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, keywords: prev.keywords.filter((_, idx) => idx !== i) }))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-bolsa-primary focus:ring-bolsa-primary"
            />
            <span className="text-sm font-medium text-gray-700">Faculdade ativa (visível no site)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/faculdades"
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar Faculdade
          </button>
        </div>
      </form>
    </div>
  )
}
