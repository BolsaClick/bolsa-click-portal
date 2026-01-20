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
  GraduationCap
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
import { validateCoupon } from '@/app/lib/api/get-coupon'
import { FaPix } from 'react-icons/fa6'
import { validateCpf } from '@/app/lib/api/validate-cpf'
import { createStudent } from '@/app/lib/api/create-student'
import { createInscription, buildInscriptionPayload } from '@/app/lib/api/create-inscription'
import { createCheckout } from '@/app/lib/api/create-checkout'
import { getCheckoutStatus } from '@/app/lib/api/checkout-status'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { useMarketplaceFeatureFlag, usePixBeforeEnrollmentFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'


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

interface CouponData {
  type: 'percent' | 'amount'
  value: number
  finalAmount: number
  originalAmount: number
  discountApplied: number
  code?: string
}

function MatriculaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { trackEvent, identifyUser } = usePostHogTracking()
  
  // Feature flags do PostHog
  const isMarketplace = useMarketplaceFeatureFlag()
  const requirePixBeforeEnrollment = usePixBeforeEnrollmentFeatureFlag()
  
  const groupId = searchParams.get('groupId') || searchParams.get('id')
  const unitId = searchParams.get('unitId')
  const modality = searchParams.get('modality')
  const shift = searchParams.get('shift') || 'VIRTUAL'

  const [expandedSections, setExpandedSections] = useState({
    dadosPessoais: true,
    contato: true,
    pagamento: true,
  })

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<CouponData | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pixQrCode, setPixQrCode] = useState<{ brCode: string; brCodeBase64: string | null } | null>(null)
  const [pixLoading, setPixLoading] = useState(false)
  const [pixError, setPixError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [cpfValidationError, setCpfValidationError] = useState<string | null>(null)
  const [isValidatingCpf, setIsValidatingCpf] = useState(false)
  const [studentCreated, setStudentCreated] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
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
    
    // Verificar se os dados necessários estão preenchidos
    if (formValues.name && formValues.cpf && formValues.email && formValues.phone) {
      handleCreateStudent()
    }
  }

  const handleCreateStudent = async () => {
    // Verificar se os dados necessários estão preenchidos
    const formValues = getValues()
    
    if (!formValues.name || !formValues.cpf || !formValues.email || !formValues.phone) {
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
      const cleanPhone = formValues.phone.replace(/\D/g, '')
      
      const studentData = {
        name: formValues.name,
        cpf: cleanCpf,
        email: formValues.email,
        phone: cleanPhone,
        courseNames: [offerDetails?.course || ''],
      }

      await createStudent(studentData)
      setStudentCreated(true)
      console.log('✅ Estudante cadastrado com sucesso')
    } catch (error: unknown) {
      console.error('Erro ao cadastrar estudante:', error)
      // Não mostrar erro para o usuário, apenas logar
      // O cadastro pode falhar silenciosamente
    } finally {
      setIsCreatingStudent(false)
    }
  }

  // Feature flag: marketplace (agora vem do PostHog)
  // const isMarketplace já está definido acima via useMarketplaceFeatureFlag()
  
  const monthlyFee = offerDetails?.montlyFeeTo || 0
  
  // Taxa administrativa fixa do Bolsa Click
  const administrativeFee = 49.99
  
  // Se marketplace estiver ativo, usar valor da API, senão usar R$ 49,99 fixo
  // Quando marketplace = true: usar subscriptionValue (valor da matrícula da API) + taxa administrativa
  // Quando marketplace = false: usar apenas taxa administrativa (R$ 49,99)
  let enrollmentFee: number
  if (isMarketplace) {
    // Marketplace ativo: usar valor da API para matrícula
    // Prioridade: subscriptionValue > montlyFeeTo (como fallback)
    enrollmentFee = offerDetails?.subscriptionValue !== undefined && offerDetails?.subscriptionValue !== null
      ? offerDetails.subscriptionValue
      : (offerDetails?.montlyFeeTo || 0)
  } else {
    // Marketplace inativo: usar apenas taxa administrativa
    enrollmentFee = administrativeFee
  }
  
  const baseMatricula = Math.round(enrollmentFee * 100) // em centavos
  
  // Texto do label baseado na feature flag
  const enrollmentLabel = isMarketplace ? 'matrícula' : 'taxa administrativa'

  // Debug: verificar valores
  useEffect(() => {
    if (offerDetails) {
      console.log('🔍 Debug Feature Flag:', {
        isMarketplace,
        envValue: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE,
        subscriptionValue: offerDetails?.subscriptionValue,
        montlyFeeTo: offerDetails?.montlyFeeTo,
        enrollmentFee,
        administrativeFee,
        monthlyFee,
        baseMatricula,
        calculatedEnrollmentFee: enrollmentFee,
      })
    }
  }, [offerDetails, isMarketplace, enrollmentFee, baseMatricula, administrativeFee, monthlyFee])

  const applyCouponToMatricula = () => {
    if (!coupon) return baseMatricula
    if (coupon.type === 'amount') {
      return Math.max(0, baseMatricula - coupon.value)
    }
    if (coupon.type === 'percent') {
      const factor = (100 - coupon.value) / 100
      return Math.max(0, Math.round(baseMatricula * factor))
    }
    return baseMatricula
  }

  const matriculaAfterCoupon = applyCouponToMatricula()
  
  // Calcular subtotal e total baseado na feature flag
  let subtotal: number
  let total: number
  
  if (isMarketplace) {
    // Marketplace ativo: mensalidade + taxa administrativa + matrícula
    const matriculaValue = coupon ? (coupon.originalAmount / 100) : enrollmentFee
    subtotal = monthlyFee + administrativeFee + matriculaValue
    // Total com cupom aplicado (se houver)
    total = monthlyFee + administrativeFee + (matriculaAfterCoupon / 100)
  } else {
    // Marketplace inativo: apenas taxa administrativa
    const adminValue = coupon ? (coupon.originalAmount / 100) : enrollmentFee
    subtotal = adminValue
    // Total com cupom aplicado (se houver)
    total = matriculaAfterCoupon / 100
  }

  const handleApplyCoupon = async () => {
    try {
      setCouponError(null)
      
      if (!couponCode || !couponCode.trim()) {
        setCouponError('Digite um código de cupom')
        trackEvent('coupon_apply_attempted', {
          coupon_code: couponCode.trim().toUpperCase(),
          error: 'empty_code',
          course_id: offerDetails?.courseId,
          course_name: offerDetails?.course,
        })
        return
      }

      // Validar cupom usando o valor da matrícula em centavos
      const result = await validateCoupon(couponCode.trim().toUpperCase(), baseMatricula)

      if (!result.valid || !result.coupon) {
        setCouponError(result.error || 'Cupom inválido')
        toast.error(result.error || 'Cupom inválido')
        trackEvent('coupon_apply_failed', {
          coupon_code: couponCode.trim().toUpperCase(),
          error: result.error || 'invalid_coupon',
          course_id: offerDetails?.courseId,
          course_name: offerDetails?.course,
        })
        return
      }

      // Aplicar cupom
      const couponData: CouponData = {
        type: result.coupon.type === 'PERCENT' ? 'percent' : 'amount',
        value: result.coupon.type === 'PERCENT' 
          ? result.coupon.discount 
          : (result.discountAmount || 0) / 100, // converter centavos para reais se for amount
        finalAmount: result.finalAmount || baseMatricula,
        originalAmount: baseMatricula,
        discountApplied: result.discountAmount || 0,
        code: couponCode.trim().toUpperCase(),
      }

      setCoupon(couponData)
      setCouponError(null)
      
      const discountValue = result.discountAmount 
        ? formatCurrency(result.discountAmount / 100)
        : `${result.coupon.discount}%`
      
      toast.success(`Cupom aplicado com sucesso! Você economizou ${discountValue}`)
      
      trackEvent('coupon_applied', {
        coupon_code: couponCode.trim().toUpperCase(),
        coupon_type: result.coupon.type,
        discount_value: result.coupon.type === 'PERCENT' ? result.coupon.discount : (result.discountAmount || 0) / 100,
        discount_amount: result.discountAmount || 0,
        original_amount: baseMatricula,
        final_amount: result.finalAmount || baseMatricula,
        course_id: offerDetails?.courseId,
        course_name: offerDetails?.course,
      })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
      const message = axiosError.response?.data?.error || axiosError.message || 'Erro ao aplicar cupom'
      setCouponError(message)
      toast.error(message)
      trackEvent('coupon_apply_error', {
        coupon_code: couponCode.trim().toUpperCase(),
        error: message,
        course_id: offerDetails?.courseId,
        course_name: offerDetails?.course,
      })
    }
  }

  // Função para verificar o status do pagamento periodicamente
  const startPaymentStatusCheck = async (transactionIdValue: string, formData: FormSchema) => {
    const maxAttempts = 60 // 5 minutos (60 * 5 segundos)
    let attempts = 0

    const checkStatus = async () => {
      try {
        attempts++
        console.log(`🔍 Verificando status do pagamento (tentativa ${attempts}/${maxAttempts})...`)
        
        const statusResponse = await getCheckoutStatus(transactionIdValue)
        console.log('📊 Status do pagamento:', statusResponse)

        if (statusResponse.status === 'paid') {
          console.log('✅ Pagamento confirmado! Criando matrícula...')
          toast.success('Pagamento confirmado! Finalizando matrícula...')
          
          trackEvent('payment_confirmed', {
            transaction_id: transactionIdValue,
            course_id: offerDetails?.courseId,
            course_name: offerDetails?.course,
            amount_in_cents: matriculaAfterCoupon,
            amount_in_reais: matriculaAfterCoupon / 100,
            payment_method: 'pix',
            has_coupon: !!coupon,
            coupon_code: coupon?.code,
          })
          
          // Pagamento confirmado, criar matrícula
          await createInscriptionAfterPayment(formData)
          
          // Parar a verificação
          return
        } else if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
          console.error('❌ Pagamento falhou ou foi cancelado')
          toast.error('Pagamento não foi confirmado. Tente novamente.')
          setPixError('Pagamento não foi confirmado')
          return
        }

        // Se ainda está pendente e não excedeu o limite, continuar verificando
        if (attempts < maxAttempts && statusResponse.status === 'pending') {
          setTimeout(checkStatus, 5000) // Verificar a cada 5 segundos
        } else if (attempts >= maxAttempts) {
          console.warn('⏱️ Timeout na verificação do pagamento')
          toast.warning('Tempo limite excedido. Verifique o status do pagamento manualmente.')
        }
      } catch (error: unknown) {
        console.error('Erro ao verificar status do pagamento:', error)
        // Continuar tentando mesmo em caso de erro
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
        }
      }
    }

    // Iniciar verificação após 5 segundos
    setTimeout(checkStatus, 5000)
  }

  // Função para criar a matrícula após o pagamento ser confirmado
  const createInscriptionAfterPayment = async (data: FormSchema) => {
    try {
      if (!offerDetails) {
        throw new Error('Detalhes da oferta não encontrados')
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
          schedules: offerDetails.schedules,
          shift: offerDetails.shift,
        }
      )

      // PromoterId - pode vir de variável de ambiente ou ser fixo
      const promoterId = process.env.NEXT_PUBLIC_PROMOTER_ID || '6716698cb4d33b0008a18001'
      
      console.log('📝 Criando inscrição no Tartarus...', inscriptionPayload)
      await createInscription(inscriptionPayload, promoterId, 'DC')
      console.log('✅ Inscrição criada com sucesso')
      
      toast.success('Matrícula realizada com sucesso!')
      
      trackEvent('enrollment_completed', {
        course_id: offerDetails.courseId,
        course_name: offerDetails.course,
        brand: offerDetails.brand,
        modality: offerDetails.modality,
        shift: offerDetails.shift,
        student_email: data.email,
        student_cpf: data.cpf.replace(/\D/g, ''),
        amount_paid: matriculaAfterCoupon / 100,
        has_coupon: !!coupon,
        coupon_code: coupon?.code,
        promoter_id: promoterId,
      })
      
      // Identificar usuário no PostHog
      identifyUser(data.cpf.replace(/\D/g, ''), {
        email: data.email,
        name: data.name,
        phone: data.phone.replace(/\D/g, ''),
      })
      
      // Redirecionar para página de sucesso ou fechar modal
      setTimeout(() => {
        setShowModal(false)
        // router.push('/checkout/matricula/sucesso')
      }, 2000)
    } catch (error: unknown) {
      console.error('Erro ao criar matrícula:', error)
      toast.error('Erro ao finalizar matrícula. Entre em contato com o suporte.')
    }
  }

  const onSubmit = async (data: FormSchema) => {
    try {
      // Validar CPF antes de prosseguir
      if (cpfValidationError) {
        toast.error('Por favor, corrija o CPF antes de continuar.')
        return
      }

      // Se a flag requirePixBeforeEnrollment estiver ativa, 
      // criar matrícula primeiro e depois cobrar
      if (requirePixBeforeEnrollment) {
        console.log('📝 Modo: PIX antes da matrícula está ativo')
        trackEvent('pix_before_enrollment_mode_activated', {
          course_id: offerDetails?.courseId,
          course_name: offerDetails?.course,
        })
        
        // TODO: Implementar lógica alternativa se necessário
        // Por enquanto, continua com o fluxo normal
      }

      setPixError(null)
      setPixLoading(true)

      if (!offerDetails) {
        throw new Error('Detalhes da oferta não encontrados')
      }

      // Valor a pagar em centavos (com desconto do cupom se houver)
      const amountInCents = matriculaAfterCoupon

      // Criar checkout na API Elysium primeiro
      const checkoutData = {
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''),
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        amountInCents,
        description: `Matrícula - ${offerDetails.course}`,
        couponCode: coupon?.code || undefined,
        brand: offerDetails.brand?.toLowerCase() || 'anhanguera',
        metadata: {
          courseId: offerDetails.courseId,
          courseName: offerDetails.course,
          unitId: offerDetails.unitId,
        },
      }

      console.log('💳 Criando checkout na API Elysium...', checkoutData)
      
      trackEvent('checkout_initiated', {
        course_id: offerDetails.courseId,
        course_name: offerDetails.course,
        brand: offerDetails.brand,
        amount_in_cents: amountInCents,
        amount_in_reais: amountInCents / 100,
        has_coupon: !!coupon,
        coupon_code: coupon?.code,
        payment_method: paymentMethod,
        student_email: data.email,
        student_cpf: data.cpf.replace(/\D/g, ''),
      })
      
      const checkoutResponse = await createCheckout(checkoutData)
      console.log('✅ Checkout criado:', checkoutResponse)

      // Salvar transactionId
      const transactionIdValue = checkoutResponse.transactionId
      if (!transactionIdValue) {
        throw new Error('TransactionId não encontrado na resposta do checkout')
      }

      setTransactionId(transactionIdValue)

      // Verificar se tem QR Code na resposta
      if (checkoutResponse.pixQrCode?.brCode && checkoutResponse.pixQrCode?.brCodeBase64) {
        setPixQrCode({
          brCode: checkoutResponse.pixQrCode.brCode,
          brCodeBase64: checkoutResponse.pixQrCode.brCodeBase64,
        })
        setPixLoading(false)
        setShowModal(true)
        toast.success('QR Code Pix gerado com sucesso!')
        
        trackEvent('pix_qr_code_generated', {
          transaction_id: transactionIdValue,
          course_id: offerDetails.courseId,
          course_name: offerDetails.course,
          amount_in_cents: amountInCents,
          amount_in_reais: amountInCents / 100,
          has_coupon: !!coupon,
          coupon_code: coupon?.code,
        })
        
        // Iniciar verificação do status do pagamento
        startPaymentStatusCheck(transactionIdValue, data)
      } else {
        throw new Error('QR Code Pix não encontrado na resposta do checkout')
      }
    } catch (err: unknown) {
      console.error('Erro no fluxo de checkout:', err)
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao processar checkout.'
      setPixError(errorMessage)
      setPixLoading(false)
      toast.error(errorMessage)
      
      trackEvent('checkout_error', {
        error: errorMessage,
        course_id: offerDetails?.courseId,
        course_name: offerDetails?.course,
        amount_in_cents: matriculaAfterCoupon,
        payment_method: paymentMethod,
        has_coupon: !!coupon,
        coupon_code: coupon?.code,
      })
    }
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
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
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
          <p className="text-gray-600 mt-1 text-sm">Complete seus dados para finalizar a {enrollmentLabel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                              <input
                                value={field.value}
                                onChange={(e) => {
                                  const masked = e.target.value
                                    .replace(/\D/g, '')
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                                  field.onChange(masked)
                                }}
                                onBlur={async (e) => {
                                  field.onBlur()
                                  const cleanCpf = e.target.value.replace(/\D/g, '')
                                  if (cleanCpf.length === 11 && validarCPF(cleanCpf)) {
                                    setIsValidatingCpf(true)
                                    setCpfValidationError(null)
                                    try {
                                      // Usar valores da oferta para validação
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
                                        toast.success('CPF validado com sucesso!')
                                        trackEvent('cpf_validated', {
                                          cpf_valid: true,
                                          inscription_allowed: true,
                                          course_id: offerDetails?.courseId,
                                          course_name: offerDetails?.course,
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
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary ${
                                  cpfValidationError ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {isValidatingCpf && (
                                <p className="text-blue-500 text-xs mt-1">Validando CPF...</p>
                              )}
                            </div>
                          )}
                        />
                        {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                        {cpfValidationError && <p className="text-red-500 text-xs mt-1">{cpfValidationError}</p>}
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
                              onChange={(e) => {
                                const masked = e.target.value
                                  .replace(/\D/g, '')
                                  .replace(/^(\d{2})(\d)/, '($1)$2')
                                  .replace(/(\d)(\d{4})$/, '$1-$2')
                                field.onChange(masked)
                              }}
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

              {/* Forma de Pagamento - Seção Expansível */}
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
                      <p className="text-xs text-gray-500">Selecione a melhor forma de pagar</p>
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
                    <div
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300 ${
                        paymentMethod === 'pix'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded flex items-center justify-center">
                              <FaPix className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <span className="font-medium text-sm text-gray-900">Pix</span>
                            <p className="text-xs text-gray-500">O pagamento será aprovado em instantes.</p>
                          </div>
                        </div>
                        {paymentMethod === 'pix' && <Check size={18} className="text-green-600" />}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || pixLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || pixLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processando...</span>
                        </div>
                      ) : (
                        'Finalizar Matrícula'
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-500">Escolha o método de pagamento *</p>
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

              {isMarketplace ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Valor da mensalidade</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyFee)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Taxa administrativa Bolsa Click</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(administrativeFee)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Valor da {enrollmentLabel}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-gray-900">{formatCurrency(matriculaAfterCoupon / 100)}</p>
                      {coupon && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          {coupon.type === 'percent' 
                            ? `-${coupon.value}%` 
                            : `-${formatCurrency(coupon.value)}`}
                        </span>
                      )}
                    </div>
                    {coupon && (
                      <p className="text-xs text-gray-400 line-through mt-1">
                        {formatCurrency(enrollmentFee)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Valor da mensalidade</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {offerDetails?.montlyFeeFrom && offerDetails.montlyFeeFrom > monthlyFee && (
                        <>
                          <p className="text-sm text-gray-400 line-through">De {formatCurrency(offerDetails.montlyFeeFrom)} por</p>
                          <p className="text-xl font-bold text-green-600 ">{formatCurrency(monthlyFee)}</p>
                          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            {Math.round(((offerDetails.montlyFeeFrom - monthlyFee) / offerDetails.montlyFeeFrom) * 100)}% de desconto
                          </span>
                        </>
                      )}
                      {(!offerDetails?.montlyFeeFrom || offerDetails.montlyFeeFrom <= monthlyFee) && (
                        <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyFee)}</p>
                      )}
                    </div>
                   
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Você só paga a taxa de serviço</p>
                        <p className="text-xs text-blue-700">
                          A mensalidade será paga diretamente à instituição.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Taxa de serviço Bolsa Click</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-gray-900">{formatCurrency(matriculaAfterCoupon / 100)}</p>
                      {coupon && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          {coupon.type === 'percent' 
                            ? `-${coupon.value}%` 
                            : `-${formatCurrency(coupon.value)}`}
                        </span>
                      )}
                    </div>
                    {coupon && (
                      <p className="text-xs text-gray-400 line-through mt-1">
                        {formatCurrency(enrollmentFee)}
                      </p>
                    )}
                  </div>
                </>
              )}

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

              <div className="pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">Digite seu cupom</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código do cupom"
                    disabled={!!coupon}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  {coupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(null)
                        setCouponCode('')
                        toast.info('Cupom removido')
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                {isMarketplace ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Pagar a mensalidade</span>
                      <span className="text-gray-900">{formatCurrency(monthlyFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Taxa de serviço Bolsa Click</span>
                      <span className="text-gray-900">{formatCurrency(administrativeFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Valor da matrícula</span>
                      <span className="text-gray-900">
                        {coupon 
                          ? formatCurrency((coupon.originalAmount / 100))
                          : formatCurrency(enrollmentFee)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Taxa de serviço Bolsa Click</span>
                    <span className="text-gray-900">
                      {coupon 
                        ? formatCurrency((coupon.originalAmount / 100))
                        : formatCurrency(administrativeFee)}
                    </span>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Cupom</span>
                    <span className="text-green-600 font-medium">
                      {coupon.type === 'percent' 
                        ? `-${coupon.value}%` 
                        : `-${formatCurrency(coupon.value)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <div className="flex items-center gap-2">
                    {coupon && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(subtotal)}
                      </span>
                    )}
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">Powered by Inovit Pay</p>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento Pix */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Pagamento via Pix</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {pixLoading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Gerando QR Code Pix...</p>
                </div>
              ) : pixError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{pixError}</p>
                </div>
              ) : pixQrCode ? (
                <div className="space-y-4 text-center">
                  {pixQrCode.brCodeBase64 ? (
                    <Image
                      src={pixQrCode.brCodeBase64}
                      alt="QR Code Pix"
                      width={192}
                      height={192}
                      className="mx-auto"
                      unoptimized
                    />
                  ) : (
                    <div className="mx-auto w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 text-sm">QR Code não disponível</p>
                    </div>
                  )}
                  <div className="bg-gray-100 border border-gray-300 p-3 rounded-md font-mono break-all text-xs">
                    {pixQrCode.brCode || 'Código Pix não disponível'}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pixQrCode.brCode || '')
                      toast.success('Código Pix copiado!')
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Copiar código Pix
                  </button>
                  {transactionId && (
                    <p className="text-xs text-gray-500 mt-2">
                      ID da transação: {transactionId}
                    </p>
                  )}
                </div>
              ) : null}
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
