'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

export default function NewCoursePage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [fullName, setFullName] = useState('')
  const [apiCourseName, setApiCourseName] = useState('')
  const [type, setType] = useState('BACHARELADO')
  const [nivel, setNivel] = useState('GRADUACAO')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [averageSalary, setAverageSalary] = useState('')
  const [marketDemand, setMarketDemand] = useState('MEDIA')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Arrays
  const [areas, setAreas] = useState<string[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [careerPaths, setCareerPaths] = useState<string[]>([])
  const [careerInput, setCareerInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug)
    setApiCourseName(value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''))
  }

  // Array helpers
  const addToArray = (
    value: string,
    array: string[],
    setArray: (arr: string[]) => void,
    setInput: (val: string) => void
  ) => {
    if (value.trim() && !array.includes(value.trim())) {
      setArray([...array, value.trim()])
      setInput('')
    }
  }

  const removeFromArray = (
    item: string,
    array: string[],
    setArray: (arr: string[]) => void
  ) => {
    setArray(array.filter((i) => i !== item))
  }

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser) return

    setUploading(true)
    setError(null)

    try {
      // Convert to base64
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
            folder: 'courses',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setImageUrl(data.url)
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
      const response = await fetch('/api/admin/featured-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          apiCourseName,
          name,
          fullName,
          type,
          nivel,
          description,
          longDescription,
          duration,
          areas,
          skills,
          careerPaths,
          averageSalary,
          marketDemand,
          imageUrl,
          keywords,
          isActive,
        }),
      })

      if (response.ok) {
        router.push('/admin/cursos')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar curso')
      }
    } catch (err) {
      console.error('Error creating course:', err)
      setError('Erro ao criar curso')
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
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cursos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Curso em Destaque</h1>
          <p className="text-gray-500">Adicione um novo curso ao catálogo de destaques</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informações Básicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Curso *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Administração"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Bacharelado em Administração"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="administracao"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* API Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome na API *
              </label>
              <input
                type="text"
                value={apiCourseName}
                onChange={(e) => setApiCourseName(e.target.value)}
                placeholder="ADMINISTRACAO"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome usado para buscar ofertas na API de cursos
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              >
                <option value="BACHARELADO">Bacharelado</option>
                <option value="LICENCIATURA">Licenciatura</option>
                <option value="TECNOLOGO">Tecnólogo</option>
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível *
              </label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              >
                <option value="GRADUACAO">Graduação</option>
                <option value="POS_GRADUACAO">Pós-Graduação</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 4 anos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>

            {/* Market Demand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demanda de Mercado
              </label>
              <select
                value={marketDemand}
                onChange={(e) => setMarketDemand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>

            {/* Average Salary */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário Médio
              </label>
              <input
                type="text"
                value={averageSalary}
                onChange={(e) => setAverageSalary(e.target.value)}
                placeholder="Ex: R$ 5.000 a R$ 15.000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Descrições</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Curta
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do curso..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Completa
              </label>
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Descrição detalhada do curso, grade curricular, diferenciais..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Imagem</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {imageUrl ? (
            <div className="relative inline-block">
              <Image
                src={imageUrl}
                alt="Preview"
                width={200}
                height={120}
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              ) : (
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
              )}
              <p className="mt-2 text-sm text-gray-500">
                {uploading ? 'Enviando...' : 'Clique para fazer upload da imagem'}
              </p>
            </button>
          )}
        </div>

        {/* Arrays Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detalhes Adicionais</h2>

          <div className="space-y-4">
            {/* Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Áreas de Atuação
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(areaInput, areas, setAreas, setAreaInput))}
                  placeholder="Ex: Gestão de Empresas"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addToArray(areaInput, areas, setAreas, setAreaInput)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {areas.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeFromArray(item, areas, setAreas)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habilidades Desenvolvidas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(skillInput, skills, setSkills, setSkillInput))}
                  placeholder="Ex: Liderança"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addToArray(skillInput, skills, setSkills, setSkillInput)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeFromArray(item, skills, setSkills)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Career Paths */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carreiras
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={careerInput}
                  onChange={(e) => setCareerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(careerInput, careerPaths, setCareerPaths, setCareerInput))}
                  placeholder="Ex: Gerente de Projetos"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addToArray(careerInput, careerPaths, setCareerPaths, setCareerInput)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {careerPaths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {careerPaths.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeFromArray(item, careerPaths, setCareerPaths)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palavras-chave (SEO)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(keywordInput, keywords, setKeywords, setKeywordInput))}
                  placeholder="Ex: curso administração ead"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addToArray(keywordInput, keywords, setKeywords, setKeywordInput)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeFromArray(item, keywords, setKeywords)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Configurações</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-bolsa-primary border-gray-300 rounded focus:ring-bolsa-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Curso ativo (visível no site)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/admin/cursos"
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !name || !slug || !fullName || !apiCourseName}
            className="flex-1 px-4 py-3 bg-bolsa-primary text-white rounded-lg hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Curso
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
