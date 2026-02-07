'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  GraduationCap,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/contexts/AuthContext'

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  educationLevel: z.string().optional(),
  currentSchool: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, updateUserProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const cep = watch('cep')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/minha-conta/perfil')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '')
      setValue('phone', user.phone || '')
      setValue('cpf', user.cpf || '')
    }
  }, [user, setValue])

  // Auto-fill address from CEP
  useEffect(() => {
    const fetchAddress = async () => {
      if (cep && cep.replace(/\D/g, '').length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
          const data = await response.json()
          if (!data.erro) {
            setValue('street', data.logradouro)
            setValue('neighborhood', data.bairro)
            setValue('city', data.localidade)
            setValue('state', data.uf)
          }
        } catch (error) {
          console.error('Error fetching address:', error)
        }
      }
    }
    fetchAddress()
  }, [cep, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      await updateUserProfile(data)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/minha-conta"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Meus Dados</h1>
          <p className="text-gray-500">Atualize suas informações pessoais</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-bolsa-primary" />
              Informações Pessoais
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      {...register('cpf')}
                      placeholder="000.000.000-00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-bolsa-primary" />
              Endereço
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    {...register('cep')}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua
                  </label>
                  <input
                    type="text"
                    {...register('street')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    {...register('number')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    {...register('complement')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    {...register('neighborhood')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-bolsa-primary" />
              Informações Acadêmicas
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de escolaridade
                </label>
                <select
                  {...register('educationLevel')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="FUNDAMENTAL">Ensino Fundamental</option>
                  <option value="MEDIO">Ensino Médio</option>
                  <option value="MEDIO_COMPLETO">Ensino Médio Completo</option>
                  <option value="GRADUACAO">Graduação em andamento</option>
                  <option value="GRADUACAO_COMPLETO">Graduação Completa</option>
                  <option value="POS_GRADUACAO">Pós-graduação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição atual (se aplicável)
                </label>
                <input
                  type="text"
                  {...register('currentSchool')}
                  placeholder="Nome da escola ou faculdade"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-bolsa-primary text-white font-semibold rounded-xl hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Salvar alterações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
