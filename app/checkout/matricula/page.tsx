'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getOfferDetails, OfferDetails } from '@/app/lib/api/get-offer-details'
import Skeleton from '@/app/components/atoms/Skeleton'
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Building2,
  BookOpen,
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Award
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getCep } from '@/app/lib/api/get-cep'
import { validarCPF } from '@/utils/cpf-validate'
import { formatCurrency } from '@/utils/fomartCurrency'
import { toast } from 'sonner'
// [CUPOM] import { validateCoupon } from '@/app/lib/api/get-coupon'
import { validateCpf } from '@/app/lib/api/validate-cpf'
import { createLead } from '@/app/lib/api/create-lead'
import { createInscription, buildInscriptionPayload } from '@/app/lib/api/create-inscription'
import { createMarketplaceInscription } from '@/app/lib/api/create-inscription-marketplace'
import { validateVoucher, type ValidateVoucherResponse, type VoucherInstallment } from '@/app/lib/api/validate-voucher'
import type { PosPaymentMethod, PosInstallment } from '@/app/lib/api/get-offer-details'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackFbq } from '@/app/lib/analytics/fbq'
import { formatPhone } from '@/utils/formatters'
import { useAuth } from '@/app/contexts/AuthContext'
import { Loader2 } from 'lucide-react'


// Validação melhorada seguindo o exemplo
const formSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  name: z
    .string()
    .min(3, 'Informe o nome completo')
    .transform((val) => val.trim()),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF inválido')
    .refine((val) => validarCPF(val), { message: 'CPF inválido' }),
  rg: z
    .string()
    .optional()
    .transform((val) => val?.replace(/[^a-zA-Z0-9]/g, '') || '')
    .refine((val) => !val || (val.length >= 5 && val.length <= 15), 'RG inválido'),
  birthDate: z
    .string()
    .refine(
      (val) => {
        const regex = /^\d{2}-\d{2}-\d{4}$/
        if (!regex.test(val)) return false
        const [day, month, year] = val.split('-').map(Number)
        const birth = new Date(year, month - 1, day)
        if (
          birth.getFullYear() !== year ||
          birth.getMonth() !== month - 1 ||
          birth.getDate() !== day
        ) return false
        const today = new Date()
        if (year < 1930 || year > today.getFullYear()) return false
        let age = today.getFullYear() - year
        const hadBirthday =
          today.getMonth() > birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
        if (!hadBirthday) age--
        return age >= 15
      },
      { message: 'Data de nascimento inválida. O candidato deve ter mais de 15 anos.' }
    ),
  schoolYear: z.string().optional(),
  gender: z.enum(['masculino', 'feminino', 'outro']).optional(),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine(
      (val) => val.length === 11 && val[2] === '9',
      'Informe um celular válido no formato (99) 99999-9999'
    ),
  cep: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 8, 'CEP inválido'),
  address: z.string().min(3, 'Informe o endereço'),
  addressNumber: z.string().min(1, 'Informe o número'),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

// [CUPOM] Comentado para possível reativação futura
// interface CouponData {
//   type: 'percent' | 'amount'
//   value: number
//   finalAmount: number
//   originalAmount: number
//   discountApplied: number
//   code?: string
// }

function MatriculaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { trackEvent, identifyUser } = usePostHogTracking()
  const { user, firebaseUser, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()


  const storedCheckoutParams = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('pendingCheckoutParams') || '') } catch { return null } })()
    : null

  const groupId = searchParams.get('groupId') || searchParams.get('id') || storedCheckoutParams?.groupId
  const unitId = searchParams.get('unitId') || storedCheckoutParams?.unitId
  const modality = searchParams.get('modality') || storedCheckoutParams?.modality
  const shift = searchParams.get('shift') || storedCheckoutParams?.shift || 'VIRTUAL'

  // Estados para login/registro no checkout
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const [expandedSections, setExpandedSections] = useState({
    dadosPessoais: true,
    contato: true,
    pagamento: true,
  })

  // [CUPOM] Comentado para possível reativação futura
  // const [couponCode, setCouponCode] = useState('')
  // const [coupon, setCoupon] = useState<CouponData | null>(null)
  // const [couponError, setCouponError] = useState<string | null>(null)
  const [cpfValidationError, setCpfValidationError] = useState<string | null>(null)
  const [isValidatingCpf, setIsValidatingCpf] = useState(false)
  const [cpfValidationOk, setCpfValidationOk] = useState(false)
  const [cpfExistsInDb, setCpfExistsInDb] = useState<boolean | null>(null)
  const [cpfEmailHint, setCpfEmailHint] = useState<string | null>(null)
  const [pendingCpfForRegistration, setPendingCpfForRegistration] = useState<string | null>(null)
  const [studentCreated, setStudentCreated] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  // Pós-graduação: método de pagamento e parcela (dia de vencimento fixo 10)
  const [posPaymentMethodType, setPosPaymentMethodType] = useState<string>('')
  const [posInstallmentId, setPosInstallmentId] = useState<string>('')
  const [voucherCode, setVoucherCode] = useState<string>('')
  const [voucherValidating, setVoucherValidating] = useState(false)
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null)
  const [voucherMessage, setVoucherMessage] = useState<string>('')
  const [voucherData, setVoucherData] = useState<ValidateVoucherResponse | null>(null)
  const [voucherInstallments, setVoucherInstallments] = useState<VoucherInstallment[]>([])
  // Graduação: tipo de ingresso (ENEM ou VESTIBULAR)
  const [selectedIngressType, setSelectedIngressType] = useState<'ENEM' | 'VESTIBULAR'>('VESTIBULAR')

  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      cpf: '',
      rg: '',
      birthDate: '',
      schoolYear: '',
      gender: undefined,
      phone: '',
      cep: '',
      address: '',
      addressNumber: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  const watchedValues = watch()

const isFormValidForPayment =
  !!watchedValues.email &&
  !!watchedValues.name &&
  !!watchedValues.cpf &&
  !!watchedValues.birthDate &&
  !!watchedValues.phone &&
  !!watchedValues.cep &&
  !!watchedValues.address &&
  !!watchedValues.addressNumber &&
  !cpfValidationError &&
  Object.keys(errors).length === 0


  // Pré-preencher formulário quando usuário estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      if (user.email) setValue('email', user.email)
      if (user.name) setValue('name', user.name)
      if (user.cpf) {
        // Formatar CPF com máscara
        const cpfFormatted = user.cpf
          .replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        setValue('cpf', cpfFormatted)
      }
      if (user.phone) {
        // Formatar telefone com máscara
        const phoneFormatted = formatPhone(user.phone)
        setValue('phone', phoneFormatted)
      }
    }
  }, [user, authLoading, setValue])

  // Funções de autenticação no checkout
  const handleAuthWithGoogle = async () => {
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      await signInWithGoogle()
      setShowAuthModal(false)
      toast.success('Login realizado com sucesso!')
    } catch (error: unknown) {
      const err = error as { message?: string }
      setAuthError(err.message || 'Erro ao fazer login com Google')
      toast.error('Erro ao fazer login com Google')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleAuthWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthLoading(true)
    setAuthError(null)
    try {
      if (authMode === 'login') {
        await signInWithEmail(authEmail, authPassword)
        toast.success('Login realizado com sucesso!')
      } else {
        await signUpWithEmail(authEmail, authPassword, authName)
        toast.success('Conta criada com sucesso!')
      }
      setShowAuthModal(false)
      // Não limpar pendingCpfForRegistration aqui - será usado no useEffect abaixo
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      let message = 'Erro ao processar'
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este email já está em uso'
      } else if (err.code === 'auth/invalid-email') {
        message = 'Email inválido'
      } else if (err.code === 'auth/weak-password') {
        message = 'Senha muito fraca (mínimo 6 caracteres)'
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Email ou senha incorretos'
      } else {
        message = err.message || 'Erro ao processar'
      }
      setAuthError(message)
      toast.error(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  // Efeito para salvar CPF após login/registro
  useEffect(() => {
    const saveCpfAfterAuth = async () => {
      if (user && firebaseUser && pendingCpfForRegistration && !user.cpf) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const formValues = getValues()

          await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              cpf: pendingCpfForRegistration,
              name: formValues.name || user.name,
              phone: formValues.phone?.replace(/\D/g, '') || user.phone,
            }),
          })

          console.log('✅ CPF salvo no perfil após autenticação')
          setPendingCpfForRegistration(null)
          setCpfExistsInDb(null)

          // Atualizar o formulário se necessário
          if (user.email && !formValues.email) {
            setValue('email', user.email)
          }
          if (user.name && !formValues.name) {
            setValue('name', user.name)
          }
        } catch (error) {
          console.error('Erro ao salvar CPF após autenticação:', error)
        }
      }
    }

    saveCpfAfterAuth()
  }, [user, firebaseUser, pendingCpfForRegistration, getValues, setValue])

  // Função para atualizar perfil do usuário no PostgreSQL
  const updateUserProfileInDB = async (data: FormSchema) => {
    if (!firebaseUser) return

    try {
      const idToken = await firebaseUser.getIdToken()

      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: data.name,
          cpf: data.cpf.replace(/\D/g, ''),
          phone: data.phone.replace(/\D/g, ''),
        }),
      })

      console.log('✅ Perfil do usuário atualizado no PostgreSQL')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      // Não bloquear o fluxo se falhar
    }
  }

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const response = await getCep(cep)
        const data = response.data
        setValue('state', data.state)
        setValue('city', data.city)
        setValue('neighborhood', data.neighborhood || '')
        setValue('address', data.street)
      } catch (error) {
        console.error('Erro ao buscar o CEP:', error)
      }
    }
  }

  const { data: offerDetails, isLoading, error } = useQuery<OfferDetails>({
    queryKey: ['offer-details', groupId, shift, modality, unitId],
    queryFn: async () => {
      if (!groupId || !modality || !unitId) {
        throw new Error('Parâmetros obrigatórios faltando')
      }
      const finalShift = shift || (modality?.toUpperCase() === 'EAD' ? 'VIRTUAL' : '')
      if (!finalShift) {
        throw new Error('Turno não especificado')
      }
      return getOfferDetails(groupId, finalShift, modality, unitId)
    },
    enabled: !!groupId && !!modality && !!unitId,
    retry: 2,
  })

  // Track checkout page loaded when offerDetails is available
  useEffect(() => {
    if (offerDetails) {
      trackEvent('checkout_page_loaded', {
        course_id: offerDetails.courseId,
        course_name: offerDetails.course,
        brand: offerDetails.brand,
        modality: offerDetails.modality,
        shift: offerDetails.shift,
        monthly_fee: offerDetails.montlyFeeTo,
        enrollment_fee: offerDetails.subscriptionValue || 0,
        unit_id: offerDetails.unitId,
        city: offerDetails.unitCity,
        state: offerDetails.unitState,
      })

      // Facebook Pixel - InitiateCheckout
      trackFbq('InitiateCheckout', {
        content_name: offerDetails.course,
        value: offerDetails.subscriptionValue || offerDetails.montlyFeeTo || 0,
        currency: 'BRL',
      })
    }
  }, [offerDetails, trackEvent])

  useEffect(() => {
    if (offerDetails) {
      const courseToSave = {
        ...offerDetails,
        minPrice: offerDetails.montlyFeeTo,
        maxPrice: offerDetails.montlyFeeFrom,
        classShift: shift || offerDetails.shift,
        modality: modality || offerDetails.modality,
      }
      localStorage.setItem('selectedCourse', JSON.stringify(courseToSave))
    }
  }, [offerDetails, shift, modality])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Função para tentar cadastrar o estudante quando necessário
  const tryCreateStudent = () => {
    if (studentCreated || isCreatingStudent) {
      return
    }

    const formValues = getValues()

    // Verificar se os dados necessários estão preenchidos (phone é opcional)
    if (formValues.name && formValues.cpf && formValues.email) {
      handleCreateStudent()
    }
  }

  const handleCreateStudent = async () => {
    // Verificar se os dados necessários estão preenchidos (phone é opcional)
    const formValues = getValues()

    if (!formValues.name || !formValues.cpf || !formValues.email) {
      // Dados não estão completos, não fazer nada
      return
    }

    // Verificar se já foi cadastrado
    if (studentCreated) {
      return
    }

    setIsCreatingStudent(true)

    try {
      const cleanCpf = formValues.cpf.replace(/\D/g, '')
      const cleanPhone = formValues.phone ? formValues.phone.replace(/\D/g, '') : ''

      const studentData: Record<string, unknown> = {
        name: formValues.name,
        cpf: cleanCpf,
        email: formValues.email,
        courseNames: [offerDetails?.course || ''],
        courseId: offerDetails?.courseId,
        courseName: offerDetails?.course,
        institutionName: offerDetails?.brand,
        modalidade: offerDetails?.modality,
      }
      // Só inclui phone se existir
      if (cleanPhone) {
        studentData.phone = cleanPhone
      }

      // Cadastrar no /api/students (salva local + envia para Elysium)
      const studentResponse = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      })

      if (studentResponse.ok) {
        const data = await studentResponse.json()
        console.log('✅ Estudante cadastrado com sucesso:', data)
        if (data.elysiumId) {
          console.log('✅ Cadastrado também no Elysium:', data.elysiumId)
        }
      }

      // Também cadastrar como lead (mantém compatibilidade)
      await createLead({
        name: formValues.name,
        cpf: cleanCpf,
        email: formValues.email,
        phone: cleanPhone || '',
        courseNames: [offerDetails?.course || ''],
        courseId: offerDetails?.courseId,
        courseName: offerDetails?.course,
        institutionName: offerDetails?.brand,
        modalidade: offerDetails?.modality,
      })

      setStudentCreated(true)
      console.log('✅ Lead cadastrado com sucesso')
    } catch (error: unknown) {
      console.error('Erro ao cadastrar estudante:', error)
      // Não mostrar erro para o usuário, apenas logar
      // O cadastro pode falhar silenciosamente
    } finally {
      setIsCreatingStudent(false)
    }
  }

  const monthlyFee = offerDetails?.montlyFeeTo || 0

  const offerSource = offerDetails?.dmhSource?.source
  const isAthenasSource = offerSource === 'ATHENAS'

  // Auto-selecionar boleto 18x para pós-graduação
  useEffect(() => {
    if (!offerDetails || offerDetails.academicLevel !== 'POS_GRADUACAO') return
    const methods = offerDetails.paymentMethods as PosPaymentMethod[] | undefined
    if (!methods?.length) return
    const boletoMethod = methods.find(pm => pm.type === 'BOLETO')
    if (!boletoMethod) return
    const inst18x = boletoMethod.installments.find(i => i.number === 18)
    if (inst18x) {
      setPosPaymentMethodType('BOLETO')
      setPosInstallmentId(inst18x.id)
    }
  }, [offerDetails])

  // Auto-validar voucher GALENA+15 para pós-graduação
  const watchedCpf = watchedValues.cpf
  useEffect(() => {
    if (!offerDetails || offerDetails.academicLevel !== 'POS_GRADUACAO') return
    if (!posInstallmentId) return
    const cpf = (watchedCpf || '').replace(/\D/g, '')
    if (cpf.length !== 11) return

    const autoValidateVoucher = async () => {
      try {
        const result = await validateVoucher('GALENA+15', cpf, posInstallmentId)
        const isValid = result.isValid ?? false
        if (isValid) {
          setVoucherCode('GALENA+15')
          setVoucherValid(true)
          setVoucherData(result)
          const matchingMethod = result.paymentMethods?.find(pm => pm.type === 'BOLETO')
            || result.paymentMethods?.[0]
          if (matchingMethod) {
            setVoucherInstallments(matchingMethod.installments)
          }
        }
      } catch (err) {
        console.error('Erro ao validar voucher GALENA+15:', err)
      }
    }
    autoValidateVoucher()
  }, [offerDetails, posInstallmentId, watchedCpf])

  // [CUPOM] Funções de cupom comentadas para possível reativação futura
  // const applyCouponToMatricula = () => {
  //   if (!coupon) return baseMatricula
  //   if (coupon.finalAmount !== undefined && coupon.finalAmount > 0) {
  //     return coupon.finalAmount
  //   }
  //   if (coupon.type === 'amount') {
  //     return Math.max(0, baseMatricula - coupon.value)
  //   }
  //   if (coupon.type === 'percent') {
  //     const factor = (100 - coupon.value) / 100
  //     return Math.max(0, Math.round(baseMatricula * factor))
  //   }
  //   return baseMatricula
  // }
  // const matriculaAfterCoupon = applyCouponToMatricula()
  // const subtotal = coupon ? (coupon.originalAmount / 100) : enrollmentFee
  // const total = matriculaAfterCoupon / 100

  // [CUPOM] handleApplyCoupon comentado para possível reativação futura
  // const handleApplyCoupon = async () => {
  //   try {
  //     setCouponError(null)
  //     if (!couponCode || !couponCode.trim()) { ... }
  //     const result = await validateCoupon(couponCode.trim().toUpperCase(), baseMatricula)
  //     if (!result.valid || !result.coupon) { ... }
  //     const couponData: CouponData = { ... }
  //     setCoupon(couponData)
  //     toast.success(...)
  //   } catch (err) { ... }
  // }
  // Função para validar voucher
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return
    const cpf = (getValues('cpf') || '').replace(/\D/g, '')
    if (!cpf) {
      setVoucherValid(false)
      setVoucherMessage('Preencha o CPF antes de validar o voucher.')
      return
    }
    if (!posInstallmentId) {
      setVoucherValid(false)
      setVoucherMessage('Selecione a parcela antes de validar o voucher.')
      return
    }
    setVoucherValidating(true)
    setVoucherValid(null)
    setVoucherMessage('')
    setVoucherData(null)
    setVoucherInstallments([])
    try {
      const result = await validateVoucher(voucherCode.trim(), cpf, posInstallmentId)
      const isValid = result.isValid ?? false
      setVoucherValid(isValid)
      if (isValid && result.paymentMethods?.length) {
        setVoucherData(result)
        // Pegar parcelas do método que bate com o selecionado
        const matchingMethod = result.paymentMethods.find((pm) => pm.type === posPaymentMethodType)
          || result.paymentMethods[0]
        if (matchingMethod) {
          setVoucherInstallments(matchingMethod.installments)
          setVoucherMessage(`Voucher aplicado! ${matchingMethod.discountPercentage}% de desconto.`)
        } else {
          setVoucherMessage('Voucher válido!')
        }
      } else {
        setVoucherMessage(result.message || 'Voucher inválido.')
      }
    } catch {
      setVoucherValid(false)
      setVoucherMessage('Erro ao validar voucher. Tente novamente.')
    } finally {
      setVoucherValidating(false)
    }
  }

  // Função para criar a matrícula (inscrição direta, sem pagamento no checkout)
  const createInscriptionAfterPayment = async (data: FormSchema) => {
    try {
      if (!offerDetails) {
        throw new Error('Detalhes da oferta não encontrados')
      }

      let paymentMethod: { id: string; dueDay: string; voucher?: string; voucherId?: number } | undefined
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pendingPosPaymentMethod')
        if (stored) {
          try {
            paymentMethod = JSON.parse(stored) as { id: string; dueDay: string; voucher?: string; voucherId?: number }
          } catch {
            // ignore
          }
        }
      }

      const inscriptionPayload = buildInscriptionPayload(
        {
          name: data.name,
          cpf: data.cpf,
          gender: data.gender || 'masculino',
          schoolYear: data.schoolYear || String(new Date().getFullYear()),
          rg: data.rg || '',
          birthDate: data.birthDate,
          email: data.email,
          phone: data.phone,
          address: data.address,
          addressNumber: data.addressNumber,
          neighborhood: data.neighborhood,
          city: data.city || '',
          state: data.state || '',
          cep: data.cep,
        },
        {
          dmhId: offerDetails.dmhId,
          businessKey: offerDetails.businessKey,
          dmhSource: offerDetails.dmhSource,
          academicLevel: offerDetails.academicLevel,
          // Graduação: usar tipo de ingresso selecionado (ENEM ou VESTIBULAR)
          // Pós-graduação: manter ingressType original da oferta
          ingressType: offerDetails.academicLevel === 'GRADUACAO'
            ? [selectedIngressType]
            : offerDetails.ingressType,
          schedules: offerDetails.schedules,
          shift: offerDetails.shift,
        },
        paymentMethod
      )

      // PromoterId - pode vir de variável de ambiente ou ser fixo
      const promoterId = process.env.NEXT_PUBLIC_PROMOTER_ID || '6716698cb4d33b0008a18001'
      
      console.log('📝 Criando inscrição no Tartarus...', inscriptionPayload)
      const response = await createInscription(inscriptionPayload, promoterId, 'DC')
      console.log('✅ Inscrição criada com sucesso', response)
      
      // Verificar se a resposta indica sucesso (201 Created)
      if (response.success || response.id) {
        toast.success('Inscrição realizada com sucesso!')
        
        trackEvent('enrollment_completed', {
          course_id: offerDetails.courseId,
          course_name: offerDetails.course,
          brand: offerDetails.brand,
          modality: offerDetails.modality,
          shift: offerDetails.shift,
          student_email: data.email,
          student_cpf: data.cpf.replace(/\D/g, ''),
          amount_paid: 0,
          promoter_id: promoterId,
        })
        
        // Identificar usuário no PostHog
        identifyUser(data.cpf.replace(/\D/g, ''), {
          email: data.email,
          name: data.name,
          phone: data.phone.replace(/\D/g, ''),
        })

        // Atualizar perfil do usuário no PostgreSQL (se estiver logado)
        if (firebaseUser) {
          await updateUserProfileInDB(data)

          // Salvar inscrição no banco de dados
          try {
            const idToken = await firebaseUser.getIdToken()
            await fetch('/api/user/enrollments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                courseId: offerDetails.courseId,
                courseName: offerDetails.course,
                institutionName: offerDetails.brand,
                modalidade: offerDetails.modality,
                turno: offerDetails.shift,
                originalPrice: offerDetails.montlyFeeFrom,
                finalPrice: offerDetails.montlyFeeTo,
                discount: offerDetails.montlyFeeFrom && offerDetails.montlyFeeTo
                  ? offerDetails.montlyFeeFrom - offerDetails.montlyFeeTo
                  : null,
                externalId: response.id || null,
                paymentId: null,
                unitId: offerDetails.unitId,
                unitCity: offerDetails.unitCity,
                unitState: offerDetails.unitState,
              }),
            })
            console.log('✅ Inscrição salva no banco de dados')
          } catch (enrollError) {
            console.error('Erro ao salvar inscrição no banco:', enrollError)
            // Não bloquear o fluxo se falhar
          }
        }

        // Para ofertas ATHENAS, criar inscrição no marketplace
        if (isAthenasSource && offerDetails?.idDmhElastic) {
          console.log('📝 Criando inscrição no marketplace ATHENAS...')
          try {
            const marketplaceResult = await createMarketplaceInscription(
              {
                name: data.name,
                cpf: data.cpf,
                email: data.email,
                phone: data.phone,
                rg: data.rg,
                birthDate: data.birthDate,
                gender: data.gender || 'masculino',
                cep: data.cep,
                address: data.address,
                addressNumber: data.addressNumber,
                neighborhood: data.neighborhood || '',
                city: data.city || '',
                state: data.state || '',
                ingressType: selectedIngressType,
                schoolYear: data.schoolYear || String(new Date().getFullYear()),
                acceptTerms: true,
                acceptEmail: true,
                acceptSms: true,
                acceptWhatsapp: true,
              },
              offerDetails
            )

            if (marketplaceResult.success) {
              console.log('✅ Inscrição no marketplace ATHENAS criada com sucesso')
              trackEvent('marketplace_inscription_created', {
                course_id: offerDetails.courseId,
                course_name: offerDetails.course,
                idDmhElastic: offerDetails.idDmhElastic,
              })
            } else {
              console.error('⚠️ Erro ao criar inscrição no marketplace:', marketplaceResult.error)
            }
          } catch (marketplaceError) {
            console.error('⚠️ Erro ao criar inscrição no marketplace:', marketplaceError)
          }
        }

        // Montar params para a página de sucesso antes de limpar o localStorage
        // Envia TODOS os 4 params para ambos os tipos (Graduação e Pós)
        // para que os JS de tracking do GTM funcionem corretamente
        const params = new URLSearchParams()

        // ID de transação único para evitar duplicação de conversões no GTM
        params.set('transactionId', `BC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`)

        if (offerDetails.course) {
          params.set('course', offerDetails.course)
        }
        const level = offerDetails.academicLevel
        if (level === 'GRADUACAO' || !level) {
          // Graduação: mensalidade (pagamento à instituição)
          params.set('monthlyFee', String(monthlyFee))
          params.set('installmentDescription', `Mensalidade ${formatCurrency(monthlyFee)}/mês`)
        } else if (level === 'POS_GRADUACAO' && offerDetails.paymentMethods?.length) {
          // Pós: opção de pagamento escolhida + valor da parcela como monthlyFee
          const methods = offerDetails.paymentMethods as PosPaymentMethod[]
          let paymentLabel = ''
          let installmentDescription = ''
          let installmentValue = 0
          if (paymentMethod) {
            for (const pm of methods) {
              const inst = pm.installments.find((i) => i.id === paymentMethod.id)
              if (inst) {
                paymentLabel = pm.type === 'CREDITO' ? 'Crédito' : pm.type === 'BOLETO' ? 'Boleto' : pm.type === 'PIX' ? 'PIX' : pm.type === 'CREDITO_RECORRENCIA' ? 'Cartão Recorrente' : pm.type === 'VOUCHER' ? 'Voucher' : pm.type
                installmentDescription = `${inst.number}x de ${formatCurrency(inst.installmentValue)}`
                installmentValue = inst.installmentValue
                break
              }
            }
          }
          if (paymentLabel) params.set('paymentMethod', paymentLabel)
          if (installmentDescription) params.set('installmentDescription', installmentDescription)
          // Pós: enviar valor da parcela como monthlyFee para o JS de valor do GTM
          params.set('monthlyFee', String(installmentValue || monthlyFee))
        }

        // Limpar dados pendentes do localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingTransactionId')
          localStorage.removeItem('pendingFormData')
          localStorage.removeItem('pendingPosPaymentMethod')
          localStorage.removeItem('pendingCheckoutParams')
        }

        router.push(`/checkout/matricula/sucesso?${params.toString()}`)
      } else {
        throw new Error('Resposta da API não indica sucesso')
      }
    } catch (error: unknown) {
      console.error('Erro ao criar matrícula:', error)
      toast.error('Erro ao finalizar matrícula. Entre em contato com o suporte.')
    }
  }

  const onSubmit = async (data: FormSchema) => {
    // Validar CPF antes de prosseguir
    if (cpfValidationError) {
      toast.error('Por favor, corrija o CPF antes de continuar.')
      return
    }

    if (!offerDetails) {
      toast.error('Detalhes da oferta não encontrados.')
      return
    }

    // Pós-graduação: validar parcela selecionada e salvar no localStorage
    const isPosGrad = offerDetails.academicLevel === 'POS_GRADUACAO' && (offerDetails.paymentMethods?.length ?? 0) > 0
    if (isPosGrad) {
      if (!posInstallmentId) {
        toast.error('Selecione a quantidade de parcelas.')
        return
      }
      let selectedInstallment: PosInstallment | null = null
      for (const pm of (offerDetails.paymentMethods ?? []) as PosPaymentMethod[]) {
        const found = pm.installments.find((i) => i.id === posInstallmentId)
        if (found) {
          selectedInstallment = found
          break
        }
      }
      if (!selectedInstallment) {
        toast.error('Plano de pagamento inválido.')
        return
      }
      if (typeof window !== 'undefined') {
        const pmData: { id: string; dueDay: string; voucher?: string; voucherId?: number } = { id: posInstallmentId, dueDay: '10' }
        if (voucherCode.trim() && voucherValid && voucherData) {
          pmData.voucher = voucherData.code || voucherCode.trim()
          pmData.voucherId = voucherData.id
        }
        localStorage.setItem(
          'pendingPosPaymentMethod',
          JSON.stringify(pmData)
        )
      }
    }

    trackEvent('checkout_inscription_submitted', {
      course_id: offerDetails.courseId,
      course_name: offerDetails.course,
    })

    // Facebook Pixel - CompleteRegistration
    trackFbq('CompleteRegistration', {
      content_name: offerDetails.course,
      value: offerDetails.montlyFeeTo || 0,
      currency: 'BRL',
    })

    await createInscriptionAfterPayment(data)
  }

  const getModalityLabel = (mod: string) => {
    if (mod === 'EAD') return 'EAD/Online'
    if (mod === 'PRESENCIAL') return 'Presencial'
    if (mod === 'SEMIPRESENCIAL') return 'Semipresencial'
    return mod
  }

  const getShiftLabel = (sh: string) => {
    if (sh === 'VIRTUAL') return 'Faça o seu horário de estudo'
    if (sh === 'MATUTINO') return 'Manhã'
    if (sh === 'VESPERTINO') return 'Tarde'
    if (sh === 'NOTURNO') return 'Noite'
    if (sh === 'INTEGRAL') return 'Integral'
    return sh
  }

  const yearOptions = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i)

  if (isLoading) {
    // Optimistic preview: pull course name and price from the previously
    // viewed course in localStorage so the user sees the offer immediately
    // (cuts perceived LCP without waiting for the API).
    const cachedCourse = typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = localStorage.getItem('selectedCourse')
            return raw ? JSON.parse(raw) as { name?: string; brand?: string; minPrice?: number } : null
          } catch {
            return null
          }
        })()
      : null

    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/curso/resultado"
            className="inline-flex items-center text-bolsa-primary hover:text-bolsa-secondary mb-6 text-sm"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Link>

          <div className="pt-4 mb-6">
            {cachedCourse?.name ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout {cachedCourse.brand || ''}</h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Carregando {cachedCourse.name}…
                </p>
              </>
            ) : (
              <Skeleton className="h-6 w-48" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Skeleton className="h-96" />
            <div className="bg-white rounded-lg shadow-md p-4 md:p-5 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen size={18} className="mr-2 text-blue-600" /> Detalhes do Curso
              </h2>
              {cachedCourse?.name ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Curso</p>
                    <p className="font-medium text-sm text-gray-900">{cachedCourse.name}</p>
                  </div>
                  {cachedCourse.minPrice ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Mensalidade a partir de</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(cachedCourse.minPrice)}</p>
                      <p className="text-xs text-gray-500 mt-1 italic">Confirmando valores…</p>
                    </div>
                  ) : (
                    <Skeleton className="h-20" />
                  )}
                </>
              ) : (
                <>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !offerDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link 
            href="/curso/resultado"
            className="inline-flex items-center text-bolsa-primary hover:text-bolsa-secondary mb-6 text-sm"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Link>
          <div className="bg-white rounded-lg shadow-md p-4 md:p-5">
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              Erro ao carregar detalhes
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {error?.message || 'Não foi possível carregar os detalhes da oferta.'}
            </p>
            <button
              onClick={() => router.push('/curso/resultado')}
              className="px-4 py-2 text-sm bg-bolsa-secondary text-white rounded-lg hover:bg-bolsa-primary"
            >
              Voltar para busca
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50  flex items-start justify-center">
      <div className="max-w-5xl w-full mx-auto px-4">
        <Link 
          href="/curso/resultado"
          className="inline-flex items-center text-bolsa-primary hover:text-bolsa-secondary mb-6 text-sm"
        >
          <ArrowLeft className="mr-2" size={16} />
          Voltar
        </Link>

        {/* Header */}
        <div className="pt-10 mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout {offerDetails.brand}</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Complete seus dados para finalizar a matrícula. O valor da matrícula e das mensalidades será pago diretamente à instituição.
          </p>

          {/* Stepper visual — dá ao usuário a sensação de funil curto e claro */}
          <ol className="mt-5 flex items-center gap-2 text-xs sm:text-sm" aria-label="Etapas do checkout">
            <li className="flex items-center gap-2 font-medium text-bolsa-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bolsa-primary text-white text-xs font-semibold">1</span>
              Seus dados
            </li>
            <span className="h-px w-6 sm:w-10 bg-gray-300" aria-hidden="true" />
            <li className="flex items-center gap-2 text-gray-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">2</span>
              Contato
            </li>
            <span className="h-px w-6 sm:w-10 bg-gray-300" aria-hidden="true" />
            <li className="flex items-center gap-2 text-gray-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">3</span>
              Confirmação
            </li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Mini-prompt de login (compacto, não bloqueia atenção) */}
            {!user && !authLoading && (
              <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center justify-end gap-3 text-xs">
                <span className="text-gray-500">Já tem conta?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuthModal(true)
                  }}
                  className="text-bolsa-primary font-medium hover:underline"
                >
                  Entrar
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={handleAuthWithGoogle}
                  className="text-gray-700 hover:underline inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            )}

            {/* Banner mostrando que está logado */}
            {user && (
              <div className="bg-green-50 p-4 border-b border-green-100">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'Avatar'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Olá, {user.name?.split(' ')[0] || 'Usuário'}!
                    </p>
                    <p className="text-xs text-green-700">
                      Seus dados foram preenchidos automaticamente
                    </p>
                  </div>
                  <Check size={20} className="text-green-600" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Dados do Aluno - Seção Expansível */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleSection('dadosPessoais')}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-bolsa-primary" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Dados do Aluno</h2>
                      <p className="text-xs text-gray-500">Informações pessoais e acadêmicas</p>
                    </div>
                  </div>
                  {expandedSections.dadosPessoais ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>
                {expandedSections.dadosPessoais && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Mail size={14} className="inline mr-1" /> E-mail
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          placeholder="seuemail@exemplo.com"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Ex: Rodrigo Silva"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CPF</label>
                        <Controller
                          control={control}
                          name="cpf"
                          render={({ field }) => (
                            <div>
                              <div className="relative">
                              <input
                                value={field.value}
                                onChange={(e) => {
                                  const masked = e.target.value
                                    .replace(/\D/g, '')
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                                  field.onChange(masked)
                                  if (cpfValidationOk) setCpfValidationOk(false)
                                  if (cpfValidationError) setCpfValidationError(null)
                                }}
                                onBlur={async (e) => {
                                  field.onBlur()
                                  const cleanCpf = e.target.value.replace(/\D/g, '')
                                  if (cleanCpf.length === 11 && validarCPF(cleanCpf)) {
                                    setIsValidatingCpf(true)
                                    setCpfValidationError(null)
                                    setCpfValidationOk(false)
                                    setCpfExistsInDb(null)
                                    setCpfEmailHint(null)
                                    try {
                                      // 1. Verificar se CPF já existe no nosso banco de dados
                                      const dbCheckResponse = await fetch('/api/auth/check-cpf', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ cpf: cleanCpf }),
                                      })
                                      const dbCheckResult = await dbCheckResponse.json()

                                      if (dbCheckResult.exists) {
                                        // CPF já cadastrado no nosso banco
                                        setCpfExistsInDb(true)
                                        setCpfEmailHint(dbCheckResult.emailHint)
                                        // Não bloquear, apenas informar
                                        // O usuário será obrigado a fazer login depois
                                      } else {
                                        setCpfExistsInDb(false)
                                        // Salvar CPF para pre-preencher no cadastro
                                        setPendingCpfForRegistration(cleanCpf)
                                      }

                                      // 2. Validar no Tartarus (verificar se pode fazer inscrição)
                                      const offerSource = offerDetails?.dmhSource?.source || 'ATHENAS'
                                      const academicLevel = offerDetails?.academicLevel || 'GRADUACAO'

                                      const result = await validateCpf(
                                        cleanCpf,
                                        'DC',
                                        offerSource,
                                        academicLevel
                                      )

                                      // Lógica de validação:
                                      // - Se inscriptionAllowed = true, pode cadastrar (mesmo que tenha outra inscrição)
                                      // - Se haveAnotherInscriptionInCycle = true, não pode cadastrar (a menos que inscriptionAllowed = true)
                                      if (result.inscriptionAllowed) {
                                        // Pode cadastrar
                                        setCpfValidationError(null)
                                        setCpfValidationOk(true)
                                        toast.success('CPF validado com sucesso!')
                                        trackEvent('cpf_validated', {
                                          cpf_valid: true,
                                          inscription_allowed: true,
                                          cpf_exists_in_db: dbCheckResult.exists,
                                          course_id: offerDetails?.courseId,
                                          course_name: offerDetails?.course,
                                        })

                                        // Facebook Pixel - AddPaymentInfo (dados pessoais preenchidos + CPF validado)
                                        trackFbq('AddPaymentInfo', {
                                          content_name: offerDetails?.course,
                                          value: offerDetails?.subscriptionValue || offerDetails?.montlyFeeTo || 0,
                                          currency: 'BRL',
                                        })
                                      } else if (result.haveAnotherInscriptionInCycle) {
                                        // Tem outra inscrição no ciclo e não está permitido cadastrar
                                        setCpfValidationError(result.message || 'Este CPF possui outra inscrição no ciclo e não pode ser cadastrado.')
                                        toast.error(result.message || 'Este CPF possui outra inscrição no ciclo.')
                                        trackEvent('cpf_validation_failed', {
                                          cpf_valid: true,
                                          inscription_allowed: false,
                                          reason: 'another_inscription_in_cycle',
                                          message: result.message,
                                          course_id: offerDetails?.courseId,
                                          course_name: offerDetails?.course,
                                        })
                                      } else {
                                        // Não está permitido cadastrar por outro motivo
                                        setCpfValidationError(result.message || 'Este CPF não pode ser cadastrado para este curso.')
                                        toast.error(result.message || 'Este CPF não pode ser cadastrado.')
                                        trackEvent('cpf_validation_failed', {
                                          cpf_valid: true,
                                          inscription_allowed: false,
                                          reason: 'other',
                                          message: result.message,
                                          course_id: offerDetails?.courseId,
                                          course_name: offerDetails?.course,
                                        })
                                      }
                                    } catch (error: unknown) {
                                      console.error('Erro ao validar CPF:', error)
                                      const axiosError = error as { response?: { data?: { message?: string } }; message?: string }
                                      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao validar CPF. Tente novamente.'
                                      setCpfValidationError(errorMessage)
                                      toast.error(errorMessage)
                                    } finally {
                                      setIsValidatingCpf(false)
                                    }
                                  }
                                }}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={`w-full px-3 py-2 pr-9 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary ${
                                  cpfValidationError
                                    ? 'border-red-500'
                                    : cpfValidationOk
                                      ? 'border-green-500'
                                      : 'border-gray-300'
                                }`}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                {isValidatingCpf && (
                                  <Loader2 size={16} className="text-bolsa-primary animate-spin" aria-label="Validando CPF" />
                                )}
                                {!isValidatingCpf && cpfValidationOk && (
                                  <Check size={16} className="text-green-600" aria-label="CPF validado" />
                                )}
                              </div>
                              </div>
                              {isValidatingCpf && (
                                <p className="text-blue-500 text-xs mt-1">Validando CPF...</p>
                              )}
                              {!isValidatingCpf && cpfValidationOk && (
                                <p className="text-green-600 text-xs mt-1">CPF validado — você pode continuar.</p>
                              )}
                            </div>
                          )}
                        />
                        {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                        {cpfValidationError && <p className="text-red-500 text-xs mt-1">{cpfValidationError}</p>}
                        {/* Mensagem quando CPF já existe no nosso banco */}
                        {cpfExistsInDb && !user && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-xs text-blue-800">
                              Este CPF já possui uma conta.
                              {cpfEmailHint && <span> Email: {cpfEmailHint}</span>}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('login')
                                setShowAuthModal(true)
                              }}
                              className="mt-1 text-xs text-bolsa-primary font-medium hover:underline"
                            >
                              Fazer login (opcional)
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">RG</label>
                        <input
                          type="text"
                          {...register('rg')}
                          placeholder="Ex: 12.345.678-9"
                          maxLength={15}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                        {errors.rg && <p className="text-red-500 text-xs mt-1">{errors.rg.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Calendar size={14} className="inline mr-1" /> Data de Nascimento
                        </label>
                        <Controller
                          name="birthDate"
                          control={control}
                          render={({ field }) => (
                            <input
                              value={field.value}
                              onChange={(e) => {
                                const masked = e.target.value
                                  .replace(/\D/g, '')
                                  .replace(/(\d{2})(\d)/, '$1-$2')
                                  .replace(/(\d{2})-(\d{2})(\d)/, '$1-$2-$3')
                                  .slice(0, 10)
                                field.onChange(masked)
                              }}
                              placeholder="DD-MM-AAAA"
                              maxLength={10}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                            />
                          )}
                        />
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <GraduationCap size={14} className="inline mr-1" /> Ano de Conclusão
                        </label>
                        <select
                          {...register('schoolYear')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        >
                          <option value="">Selecione</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gênero</label>
                        <select
                          {...register('gender')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        >
                          <option value="">Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contato - Seção Expansível */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => {
                    toggleSection('contato')
                    // Tentar cadastrar quando expandir a seção
                    if (!expandedSections.contato) {
                      setTimeout(() => tryCreateStudent(), 100)
                    }
                  }}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-green-600" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Contato</h2>
                      <p className="text-xs text-gray-500">Informações de contato e endereço</p>
                    </div>
                  </div>
                  {expandedSections.contato ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>
                {expandedSections.contato && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Phone size={14} className="inline mr-1" /> Telefone
                        </label>
                        <Controller
                          control={control}
                          name="phone"
                          render={({ field }) => (
                            <input
                              value={field.value}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              onFocus={() => {
                                // Tentar cadastrar quando o usuário focar no campo
                                tryCreateStudent()
                              }}
                              onBlur={() => {
                                // Tentar cadastrar quando o usuário sair do campo
                                tryCreateStudent()
                              }}
                              placeholder="(00) 00000-0000"
                              maxLength={15}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                            />
                          )}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CEP</label>
                        <Controller
                          name="cep"
                          control={control}
                          render={({ field }) => (
                            <input
                              value={field.value}
                              onChange={(e) => {
                                const masked = e.target.value
                                  .replace(/\D/g, '')
                                  .replace(/(\d{5})(\d)/, '$1-$2')
                                  .slice(0, 9)
                                field.onChange(masked)
                                if (masked.replace(/\D/g, '').length === 8) {
                                  handleCepChange(masked)
                                }
                              }}
                              onFocus={() => {
                                // Tentar cadastrar quando o usuário focar no campo
                                tryCreateStudent()
                              }}
                              onBlur={() => {
                                // Tentar cadastrar quando o usuário sair do campo
                                tryCreateStudent()
                              }}
                              placeholder="00000-000"
                              maxLength={9}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                            />
                          )}
                        />
                        {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                      <input
                        type="text"
                        {...register('address')}
                        onFocus={() => {
                          // Tentar cadastrar quando o usuário focar no campo
                          tryCreateStudent()
                        }}
                        onBlur={() => {
                          // Tentar cadastrar quando o usuário sair do campo
                          tryCreateStudent()
                        }}
                        placeholder="Ex: Avenida Paulista"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
                        <input
                          type="text"
                          {...register('addressNumber')}
                          placeholder="1106"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                        {errors.addressNumber && <p className="text-red-500 text-xs mt-1">{errors.addressNumber.message}</p>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
                        <input
                          type="text"
                          {...register('neighborhood')}
                          placeholder="Ex: Centro"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                          type="text"
                          {...register('city')}
                          placeholder="Ex: São Paulo"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                        <input
                          type="text"
                          {...register('state')}
                          placeholder="Ex: SP"
                          maxLength={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo de Ingresso - Apenas para Graduação */}
              {offerDetails.academicLevel === 'GRADUACAO' && (
                <div className="border-t border-gray-100">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={18} className="text-blue-600" />
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">Forma de Ingresso</h2>
                        <p className="text-xs text-gray-500">Selecione como deseja ingressar no curso</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedIngressType('ENEM')}
                        className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedIngressType === 'ENEM'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm text-gray-900">ENEM</span>
                            <p className="text-xs text-gray-500">Usar nota do ENEM</p>
                          </div>
                          {selectedIngressType === 'ENEM' && <Check size={18} className="text-blue-600" />}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIngressType('VESTIBULAR')}
                        className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedIngressType === 'VESTIBULAR'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm text-gray-900">Vestibular</span>
                            <p className="text-xs text-gray-500">Fazer vestibular online</p>
                          </div>
                          {selectedIngressType === 'VESTIBULAR' && <Check size={18} className="text-blue-600" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de Pagamento - Seção Expansível (oculta opções quando pix_enabled = false) */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('pagamento')}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-orange-600" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Forma de Pagamento</h2>
                      <p className="text-xs text-gray-500">Valor da matrícula pago diretamente à instituição</p>
                    </div>
                  </div>
                  {expandedSections.pagamento ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>
                
                {expandedSections.pagamento && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Sem checkout: pós mostra parcelas; graduação só botão */}
                    {offerDetails.academicLevel === 'POS_GRADUACAO' && (offerDetails.paymentMethods?.length ?? 0) > 0 ? (
                        <>
                          <label className="block text-xs font-medium text-gray-700">Método de pagamento</label>
                          <div className="flex flex-wrap gap-2">
                            {(offerDetails.paymentMethods as PosPaymentMethod[]).map((pm) => {
                              const label =
                                pm.type === 'CREDITO' ? 'Crédito' : pm.type === 'BOLETO' ? 'Boleto' : pm.type === 'PIX' ? 'PIX' : pm.type === 'CREDITO_RECORRENCIA' ? 'Cartão Recorrente' : pm.type === 'VOUCHER' ? 'Voucher' : pm.type
                              return (
                                <button
                                  key={pm.type}
                                  type="button"
                                  onClick={() => {
                                    setPosPaymentMethodType(pm.type)
                                    setPosInstallmentId('')
                                  }}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                    posPaymentMethodType === pm.type ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                          {posPaymentMethodType && (
                            <>
                              <label className="block text-xs font-medium text-gray-700 mt-3">Quantidade de parcelas</label>
                              <div className="space-y-2">
                                {(
                                  (offerDetails.paymentMethods as PosPaymentMethod[]).find((pm) => pm.type === posPaymentMethodType)?.installments ?? []
                                ).map((inst: PosInstallment) => {
                                  const voucherInst = voucherValid ? voucherInstallments.find((v) => v.number === inst.number) : null
                                  const displayValue = voucherInst ? voucherInst.installmentValue : inst.installmentValue
                                  const displayTotal = voucherInst ? voucherInst.totalValue : inst.totalValue
                                  return (
                                    <div
                                      key={inst.id}
                                      onClick={() => setPosInstallmentId(inst.id)}
                                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex justify-between items-center ${
                                        posInstallmentId === inst.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div>
                                        <span className="font-medium text-sm">
                                          {inst.number}x de {formatCurrency(displayValue)}
                                        </span>
                                        {voucherInst && (
                                          <span className="text-xs text-gray-400 line-through ml-2">
                                            {formatCurrency(inst.installmentValue)}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {voucherInst && (
                                          <span className="text-xs font-medium text-green-600">-{voucherInst.discountPercentage}%</span>
                                        )}
                                        <span className="text-xs text-gray-500">Total: {formatCurrency(displayTotal)}</span>
                                        {posInstallmentId === inst.id && <Check size={18} className="text-green-600" />}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              <p className="text-xs text-gray-600 mt-3">
                                Vencimento: dia <strong>10</strong> de cada mês (fixo para pós-graduação).
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-600 mt-3">
                            O valor da matrícula e das mensalidades será pago diretamente à instituição de ensino.
                          </p>

                          {/* Voucher */}
                          <div className="mt-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Possui um voucher?</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => {
                                  setVoucherCode(e.target.value)
                                  setVoucherValid(null)
                                  setVoucherMessage('')
                                  setVoucherData(null)
                                  setVoucherInstallments([])
                                                              }}
                                placeholder="Digite o código do voucher"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleValidateVoucher}
                                disabled={voucherValidating || !voucherCode.trim()}
                                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {voucherValidating ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  'Validar'
                                )}
                              </button>
                            </div>
                            {voucherMessage && (
                              <p className={`text-xs mt-2 ${voucherValid ? 'text-green-600' : 'text-red-600'}`}>
                                {voucherMessage}
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting || !posInstallmentId}
                            className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processando...</span>
                              </div>
                            ) : (
                              'Finalizar Matrícula'
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">
                            O valor da matrícula e das mensalidades será pago diretamente à instituição de ensino. Clique em Finalizar Matrícula para concluir.
                          </p>
                          <button
                            type="submit"
                            disabled={isSubmitting || !isFormValidForPayment}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processando...</span>
                              </div>
                            ) : (
                              'Finalizar Matrícula'
                            )}
                          </button>
                        </>
                      )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Coluna Direita - Detalhes do Curso */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-5 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen size={18} className="mr-2 text-blue-600" /> Detalhes do Curso
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Curso</p>
                <p className="font-medium text-sm text-gray-900">{offerDetails.course}</p>
              </div>

              {/* Mensalidade - sempre exibida como informação */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Valor da mensalidade</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {voucherValid && voucherInstallments.length > 0 && (() => {
                    // Encontrar parcela do voucher correspondente à selecionada
                    const selectedOriginal = posInstallmentId
                      ? ((offerDetails.paymentMethods as PosPaymentMethod[])
                          .find((pm) => pm.type === posPaymentMethodType)
                          ?.installments?.find((i) => i.id === posInstallmentId))
                      : null
                    const selectedNumber = selectedOriginal?.number
                    const vInst = voucherInstallments.find((v) => v.number === selectedNumber) || voucherInstallments[0]
                    return (
                      <>
                        <p className="text-sm text-gray-400 line-through">De {formatCurrency(vInst.originalInstallmentValue)} por</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(vInst.installmentValue)}</p>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Voucher -{vInst.discountPercentage}%
                        </span>
                      </>
                    )
                  })()}
                  {!(voucherValid && voucherInstallments.length > 0) && offerDetails?.montlyFeeFrom && offerDetails.montlyFeeFrom > monthlyFee ? (
                    <>
                      <p className="text-sm text-gray-400 line-through">De {formatCurrency(offerDetails.montlyFeeFrom)} por</p>
                      <p className="text-xl font-bold text-green-600 ">{formatCurrency(monthlyFee)}</p>
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {Math.round(((offerDetails.montlyFeeFrom - monthlyFee) / offerDetails.montlyFeeFrom) * 100)}% de desconto
                      </span>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyFee)}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">Paga diretamente à instituição</p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Matrícula e mensalidade na instituição</p>
                    <p className="text-xs text-blue-700">
                      O valor da matrícula e das mensalidades será pago diretamente à instituição de ensino. Nenhuma taxa é cobrada neste checkout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Building2 size={16} className="text-purple-600" />
                  <span>{offerDetails.brand}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <BookOpen size={16} className="text-blue-600" />
                  <span>{getModalityLabel(offerDetails.modality)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={16} className="text-orange-600" />
                  <span>{getShiftLabel(offerDetails.shift)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={16} className="text-red-600" />
                  <span className="break-words">{offerDetails.unitCity}, {offerDetails.unitState} - {offerDetails.unit?.replace(/.*- /, '') || ''}</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">
                  * Este desconto é válido para todas as mensalidades, exceto rematrículas e dependências
                </p>
              </div>

              {/* [CUPOM] Seção de cupom comentada para possível reativação futura */}

              {/* Sinais de confiança — pagamento, parceria e segurança */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <ShieldCheck size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">Sem cobrança aqui.</strong> Você só paga matrícula e mensalidade à instituição.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <Award size={16} className="text-bolsa-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Parceiro oficial das principais instituições de ensino do Brasil.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Mais de 100 mil estudantes já garantiram bolsa pelo Bolsa Click.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login/Registro */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {authMode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Login com Google */}
              <button
                type="button"
                onClick={handleAuthWithGoogle}
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Continuar com Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Info do CPF que será vinculado */}
              {pendingCpfForRegistration && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>CPF:</strong> {pendingCpfForRegistration.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Este CPF será vinculado à sua conta após o cadastro.
                  </p>
                </div>
              )}

              {/* Formulário de Email */}
              <form onSubmit={handleAuthWithEmail} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary"
                  />
                </div>

                {authError && (
                  <p className="text-red-500 text-xs">{authError}</p>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-bolsa-primary text-white py-3 rounded-xl font-semibold hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    authMode === 'login' ? 'Entrar' : 'Criar conta'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600">
                {authMode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-bolsa-primary font-medium hover:underline"
                    >
                      Criar conta
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-bolsa-primary font-medium hover:underline"
                    >
                      Entrar
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MatriculaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      }
    >
      <MatriculaContent />
    </Suspense>
  )
}
