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
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validarCPF } from '@/utils/cpf-validate'
import { formatCurrency } from '@/utils/fomartCurrency'
import { getPriceAnchor } from '@/app/lib/utils/price-anchor'
import { toast } from 'sonner'
// [CUPOM] import { validateCoupon } from '@/app/lib/api/get-coupon'
import { createLead } from '@/app/lib/api/create-lead'
import { validateEmailDeliverability } from '@/app/lib/api/validate-email'
import { suggestEmailCorrection } from '@/app/lib/validation/email-typo'
import { createInscription, buildInscriptionPayload, getCognaErrorMessage, getCognaErrorDetails, canCreateInscription } from '@/app/lib/api/create-inscription'
import { createMarketplaceInscription } from '@/app/lib/api/create-inscription-marketplace'
import { validateVoucher, type ValidateVoucherResponse, type VoucherInstallment } from '@/app/lib/api/validate-voucher'
import type { PosPaymentMethod, PosInstallment } from '@/app/lib/api/get-offer-details'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { useMarketplaceFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import { pushDataLayerEvent } from '@/app/lib/analytics/gtag'
import { trackTikTok, trackTikTokDual } from '@/app/lib/analytics/ttq'
import { readUtmifyParams } from '@/app/lib/analytics/utmify-client'
import {
  trackCheckoutViewed,
  trackCheckoutIdentified,
  trackCheckoutSubmitted,
  reportInscriptionFailure,
} from '@/app/lib/analytics/checkout-funnel'
import { formatPhone } from '@/utils/formatters'
import { useAuth } from '@/app/contexts/AuthContext'
import { Loader2 } from 'lucide-react'


// Captação mínima (fluxo acordado com a Cogna — parceiro autorizou
// explicitamente): o formulário captura só os 5 campos que a Cogna cruza
// com a Receita + contato (nome, CPF, data de nascimento, telefone, e-mail).
// Os demais campos administrativos exigidos pelo payload da Cogna (RG,
// gênero, ano de conclusão, endereço) vão com um valor padrão válido em
// FORMATO — a própria instituição confirma os dados reais na matrícula
// efetiva. Ver DADOS_ADMIN_PADRAO abaixo; um teste real de inscrição (HTTP
// 201) já validou esse formato como aceito pela Cogna.
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
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine(
      (val) => val.length === 11 && val[2] === '9',
      'Informe um celular válido no formato (99) 99999-9999'
    ),
})

type FormSchema = z.infer<typeof formSchema>

/**
 * Dados administrativos padrão exigidos pelo payload da Cogna, mas não
 * capturados no formulário (captação mínima acordada com o parceiro). São
 * válidos em FORMATO — a Cogna valida formato, não conteúdo, e confirma os
 * dados reais do candidato na matrícula efetiva. NUNCA enviar estes valores
 * ao CRM — só ao payload de inscrição da Cogna/Tartarus.
 */
const DADOS_ADMIN_PADRAO = {
  rg: '000000000',
  gender: 'masculino' as const,
  schoolYear: '2020',
  address: 'Avenida Paulista',
  addressNumber: '1000',
  neighborhood: 'Bela Vista',
  cep: '01310100',
  state: 'SP',
  city: 'São Paulo',
}

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
  const { trackEvent, identifyUser, setUserProperties } = usePostHogTracking()
  // Auth só pra autofill de quem JÁ está logado no site — o checkout não pede
  // login nem cria conta (a matrícula não precisa; era atrito no funil).
  const { user, firebaseUser, loading: authLoading } = useAuth()


  const storedCheckoutParams = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('pendingCheckoutParams') || '') } catch { return null } })()
    : null

  const groupId = searchParams.get('groupId') || searchParams.get('id') || storedCheckoutParams?.groupId
  const unitId = searchParams.get('unitId') || storedCheckoutParams?.unitId
  const modality = searchParams.get('modality') || storedCheckoutParams?.modality
  const shift = searchParams.get('shift') || storedCheckoutParams?.shift || 'VIRTUAL'

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
  // Trava de CPF já inscrito (Cogna, GET can-create-inscription). Guarda a
  // mensagem amigável quando `inscriptionAllowed === false` — usada pra
  // desabilitar o botão de envio e avisar o candidato. Falha de rede na
  // checagem NÃO seta isso (fail-open, ver onBlur do CPF).
  const [cpfInscriptionBlocked, setCpfInscriptionBlocked] = useState<string | null>(null)
  const [studentCreated, setStudentCreated] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  // Desacoplado de studentCreated: /api/leads exige phone (diferente de
  // /api/students, que trata phone como opcional). O estudante pode ser
  // cadastrado antes do telefone existir; o lead (estágio 1 do CRM) só
  // depois, quando o telefone estiver preenchido.
  const [leadCreated, setLeadCreated] = useState(false)
  // Pós-graduação: método de pagamento e parcela (dia de vencimento fixo 10)
  const [posPaymentMethodType, setPosPaymentMethodType] = useState<string>('')
  const [posInstallmentId, setPosInstallmentId] = useState<string>('')
  // `voucherCode`/`voucherValid`/`voucherData`/`voucherInstallments` são o
  // voucher ATUALMENTE APLICADO (seja o GALENA+15 automático da pós, seja um
  // voucher digitado à mão que validou). `voucherInputValue` é só o texto do
  // campo manual — desacoplado do aplicado pra digitar não apagar de cara um
  // desconto já em vigor antes mesmo de clicar em Validar.
  const [voucherCode, setVoucherCode] = useState<string>('')
  const [voucherValidating, setVoucherValidating] = useState(false)
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null)
  const [voucherMessage, setVoucherMessage] = useState<string>('')
  const [voucherMessageType, setVoucherMessageType] = useState<'success' | 'error'>('error')
  const [voucherData, setVoucherData] = useState<ValidateVoucherResponse | null>(null)
  const [voucherInstallments, setVoucherInstallments] = useState<VoucherInstallment[]>([])
  const [voucherInputValue, setVoucherInputValue] = useState<string>('')
  // Pós-graduação: true enquanto o voucher GALENA+15 (obrigatório, aplicado
  // sozinho) está sendo validado/retentado — trava o botão de "Finalizar
  // matrícula" pra não correr com a inscrição antes da consulta voltar.
  const [posVoucherAutoValidating, setPosVoucherAutoValidating] = useState(false)
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
      birthDate: '',
      phone: '',
    },
  })

  const watchedValues = watch()

  // Sugestão de digitação do e-mail — nunca bloqueia, só sugere (ver
  // app/lib/validation/email-typo.ts). Recalcula a cada troca do campo.
  const emailTypoSuggestion = watchedValues.email
    ? suggestEmailCorrection(watchedValues.email)
    : null

const isFormValidForPayment =
  !!watchedValues.email &&
  !!watchedValues.name &&
  !!watchedValues.cpf &&
  !!watchedValues.birthDate &&
  !!watchedValues.phone &&
  !cpfValidationError &&
  !cpfInscriptionBlocked &&
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

      // Funil unificado — etapa 1 (ver app/lib/analytics/checkout-funnel.ts)
      trackCheckoutViewed(trackEvent, {
        flow: 'matricula',
        academicLevel: offerDetails.academicLevel,
        brand: offerDetails.brand,
        modality: offerDetails.modality,
        courseId: offerDetails.courseId,
        courseName: offerDetails.course,
      })

      // Facebook Pixel + Conversions API - InitiateCheckout
      void trackFbqDual('InitiateCheckout', {
        content_name: offerDetails.course,
        content_ids: offerDetails.courseId ? [String(offerDetails.courseId)] : undefined,
        content_type: 'product',
        value: offerDetails.subscriptionValue || offerDetails.montlyFeeTo || 0,
        currency: 'BRL',
      })

      // GA4 ecommerce (dataLayer/GTM) - begin_checkout, paridade com o InitiateCheckout acima.
      pushDataLayerEvent('begin_checkout', {
        ecommerce: {
          currency: 'BRL',
          value: offerDetails.subscriptionValue || offerDetails.montlyFeeTo || 0,
          items: [
            {
              item_id: offerDetails.courseId ? String(offerDetails.courseId) : undefined,
              item_name: offerDetails.course,
              item_brand: offerDetails.brand,
            },
          ],
        },
      })

      // TikTok Pixel - InitiateCheckout
      trackTikTok('InitiateCheckout', {
        content_id: offerDetails.courseId,
        content_name: offerDetails.course,
        content_type: 'product',
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
    if ((studentCreated && leadCreated) || isCreatingStudent) {
      return
    }

    const formValues = getValues()

    // Verificar se os dados necessários estão preenchidos (phone é opcional
    // pro /api/students, mas obrigatório pro /api/leads — ver abaixo)
    if (formValues.name && formValues.cpf && formValues.email) {
      handleCreateStudent()
    }
  }

  const handleCreateStudent = async () => {
    // Verificar se os dados necessários estão preenchidos (phone é opcional
    // só pro /api/students)
    const formValues = getValues()

    if (!formValues.name || !formValues.cpf || !formValues.email) {
      // Dados não estão completos, não fazer nada
      return
    }

    const cleanCpf = formValues.cpf.replace(/\D/g, '')
    const cleanPhone = formValues.phone ? formValues.phone.replace(/\D/g, '') : ''

    // Já cadastrado como estudante e, se havia telefone disponível, também
    // como lead — nada mais a fazer.
    if (studentCreated && (leadCreated || !cleanPhone)) {
      return
    }

    setIsCreatingStudent(true)

    try {
      if (!studentCreated) {
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

        setStudentCreated(true)
      }

      // Estágio 1 do CRM (/api/leads) exige name+cpf+email+phone — diferente
      // de /api/students, que aceita phone vazio. Só disparamos quando o
      // telefone já estiver preenchido, senão o endpoint responde 400. Isso
      // fica pendente até o usuário preencher o telefone; tryCreateStudent
      // é re-chamado nos handlers de foco/blur dos campos de contato.
      if (cleanPhone && !leadCreated) {
        await createLead({
          name: formValues.name,
          cpf: cleanCpf,
          email: formValues.email,
          phone: cleanPhone,
          courseNames: [offerDetails?.course || ''],
          courseId: offerDetails?.courseId,
          courseName: offerDetails?.course,
          institutionName: offerDetails?.brand,
          modalidade: offerDetails?.modality,
          // Nascimento: pedido no formulário desde sempre, mas até 2026-08-11
          // ia só no payload da Cogna e era descartado do nosso lado.
          birthDate: formValues.birthDate,
          source: 'checkout-matricula',
          // UTMs do localStorage da UTMify: sobrevivem à navegação, então
          // pegam o clique que trouxe a pessoa mesmo que ela tenha navegado
          // pelo site antes de chegar no checkout.
          utm: readUtmifyParams() as unknown as Record<string, string | null>,
          extraData: {
            unidade: offerDetails?.unit,
            cidade: offerDetails?.unitCity,
            estado: offerDetails?.unitState,
            turno: offerDetails?.shift,
            nivel: offerDetails?.academicLevel,
            oferta_source: offerDetails?.dmhSource?.source,
          },
        })

        setLeadCreated(true)
        console.log('✅ Lead cadastrado com sucesso')

        // TikTok Pixel + Events API - SubmitForm (lead capture)
        void trackTikTokDual(
          'SubmitForm',
          {
            content_id: offerDetails?.courseId,
            content_name: offerDetails?.course,
            content_type: 'product',
          },
          {
            email: formValues.email,
            phone: cleanPhone,
            externalId: cleanCpf,
          },
        )
      }
    } catch (error: unknown) {
      console.error('Erro ao cadastrar estudante:', error)
      // Não mostrar erro para o usuário, apenas logar
      // O cadastro pode falhar silenciosamente
    } finally {
      setIsCreatingStudent(false)
    }
  }

  const monthlyFee = offerDetails?.montlyFeeTo || 0

  // Ancoragem de preço (riscado + % + economia total até o fim do curso) —
  // usa os preços reais da oferta (nunca inventa desconto). Duração vem de
  // offerDetails.duration quando a API manda (Cogna).
  const priceAnchor = getPriceAnchor({
    from: offerDetails?.montlyFeeFrom,
    to: monthlyFee,
    durationMonths: offerDetails?.duration,
  })

  const offerSource = offerDetails?.dmhSource?.source
  const isAthenasSource = offerSource === 'ATHENAS'

  // Kill switch (decisão de negócio, 2026-08): createMarketplaceInscription
  // duplicava a inscrição na Cogna para ofertas ATHENAS (uma via
  // createInscription normal + outra via marketplace, canalVendas.id=141).
  // Nasce OFF — flag 'marketplace_enabled' no PostHog, mesmo nome usado no
  // lado servidor (confirm-matricula.ts). Religa subindo a flag pra 100%.
  const marketplaceEnabled = useMarketplaceFeatureFlag()

  // Cobrança da matrícula no checkout transparente: DESATIVADA (decisão de
  // negócio) para graduação EAD/semipresencial de ofertas ATHENAS — a Cogna
  // dobrou a comissão nesse segmento, mas exige que o pagamento NÃO seja
  // coletado no nosso site. `chargeable` aqui só sinaliza "é esse segmento";
  // não é mais usado para decidir se cobra (ver onSubmit e o JSX da seção 03).
  // O pagamento de verdade fica com a Cogna (payment-link deles, quando
  // integrado) — enquanto isso não existe, a inscrição é criada direto e o
  // aluno vai pra tela de sucesso sem pagar nada aqui.

  // Níveis que usam seleção de método de pagamento + voucher via Tartarus.
  // Graduação continua pagando direto na instituição (botão simples).
  const hasPaymentPlans =
    (offerDetails?.academicLevel === 'POS_GRADUACAO'
      || offerDetails?.academicLevel === 'CURSO_PROFISSIONALIZANTE')
    && (offerDetails?.paymentMethods?.length ?? 0) > 0

  // Campo de voucher digitado à mão: liberado nos dois níveis Cosmos (pós e
  // profissionalizante) — só essas ofertas suportam
  // POST /api/v1/offers/validate-voucher na Cogna. Graduação é ATHENAS e não
  // tem voucher; mostrar o campo lá prometeria o que a API não entrega.
  // Na pós, o manual convive com o GALENA+15 automático (ver useEffect
  // abaixo e `handleValidateVoucher`): o automático é o padrão, um voucher
  // manual válido o substitui, e um manual inválido/indisponível NÃO derruba
  // o automático já aplicado.
  const showVoucherField =
    offerDetails?.academicLevel === 'CURSO_PROFISSIONALIZANTE'
    || offerDetails?.academicLevel === 'POS_GRADUACAO'

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

  // Auto-validar voucher GALENA+15 para pós-graduação.
  //
  // Corrida de tempo original: essa validação é assíncrona e o botão de
  // envio não esperava por ela. Se a request falhasse por rede, voltasse
  // inválida, ou simplesmente não tivesse terminado ainda, o submit seguia
  // sem `voucherCode`/`voucherData` — e a Cogna recusa com 400
  // ("paymentMethod.voucher must be a string") porque `paymentMethod` foi
  // enviado sem `voucher`. Aqui: (1) uma retentativa com backoff curto antes
  // de desistir, em vez de engolir o erro em silêncio; (2) `posVoucherAutoValidating`
  // fica true do início até o resultado final (sucesso ou falha após a
  // retentativa), e o botão de submit trava enquanto isso (ver JSX do CTA).
  const watchedCpf = watchedValues.cpf
  useEffect(() => {
    if (!offerDetails || offerDetails.academicLevel !== 'POS_GRADUACAO') return
    if (!posInstallmentId) return
    const cpf = (watchedCpf || '').replace(/\D/g, '')
    if (cpf.length !== 11) return

    let cancelled = false

    const tryValidateOnce = async (): Promise<ValidateVoucherResponse | null> => {
      try {
        const result = await validateVoucher('GALENA+15', cpf, posInstallmentId)
        if (result.status === 200 && (result.data?.isValid ?? false)) {
          return result.data
        }
        return null
      } catch (err) {
        console.error('Erro ao validar voucher GALENA+15:', err)
        return null
      }
    }

    const autoValidateVoucher = async () => {
      setPosVoucherAutoValidating(true)
      setVoucherValid(null)

      let result = await tryValidateOnce()
      if (!result && !cancelled) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (cancelled) return
        result = await tryValidateOnce()
      }
      if (cancelled) return

      if (result) {
        setVoucherCode('GALENA+15')
        setVoucherValid(true)
        setVoucherData(result)
        const matchingMethod = result.paymentMethods?.find(pm => pm.type === 'BOLETO')
          || result.paymentMethods?.[0]
        if (matchingMethod) {
          setVoucherInstallments(matchingMethod.installments)
        }
      } else {
        // Esgotou a retentativa: marca como inválido pra travar o submit no
        // onSubmit (ver checagem `pos_voucher_indisponivel`) em vez de deixar
        // o payload seguir sem voucher pra Cogna recusar.
        setVoucherValid(false)
        setVoucherData(null)
      }
      setPosVoucherAutoValidating(false)
    }
    autoValidateVoucher()

    return () => {
      cancelled = true
    }
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
  // Validação manual de voucher (campo digitado), Cosmos-only (pós e
  // profissionalizante). Feedback honesto por status HTTP, conforme a doc da
  // Cogna — nunca colapsa em "erro" genérico:
  //   200 -> aplica e mostra o desconto (substitui o que estava aplicado antes,
  //          inclusive o GALENA+15 automático da pós)
  //   204 -> "nenhum voucher disponível pra este CPF" — NÃO mexe no que já
  //          estava aplicado (mantém o GALENA+15 automático, se houver)
  //   400 -> "inválido/expirado" — idem, preserva o que já estava aplicado
  //   500/rede -> "não conseguimos validar agora" — idem, preserva
  // Ou seja: só o caminho de sucesso (200) toca em voucherCode/voucherValid/
  // voucherData/voucherInstallments. Todo caminho de falha só atualiza a
  // mensagem do campo, deixando intacto o desconto já em vigor — pra não
  // derrubar o automático da pós por causa de uma tentativa manual malsucedida.
  const handleValidateVoucher = async () => {
    const code = voucherInputValue.trim()
    if (!code) return
    const cpf = (getValues('cpf') || '').replace(/\D/g, '')
    if (cpf.length !== 11) {
      setVoucherMessageType('error')
      setVoucherMessage('Preencha um CPF válido antes de validar o voucher.')
      return
    }
    if (!posInstallmentId) {
      setVoucherMessageType('error')
      setVoucherMessage('Selecione a forma de pagamento e a parcela antes de validar o voucher.')
      return
    }
    setVoucherValidating(true)
    setVoucherMessage('')
    try {
      const result = await validateVoucher(code, cpf, posInstallmentId)

      if (result.status === 200 && (result.data?.isValid ?? false) && result.data) {
        const data = result.data
        const matchingMethod = data.paymentMethods?.find((pm) => pm.type === posPaymentMethodType)
          || data.paymentMethods?.[0]
        setVoucherCode(code)
        setVoucherValid(true)
        setVoucherData(data)
        setVoucherInstallments(matchingMethod?.installments ?? [])
        setVoucherMessageType('success')
        setVoucherMessage(
          matchingMethod
            ? `Voucher aplicado! ${matchingMethod.discountPercentage}% de desconto.`
            : 'Voucher aplicado!'
        )
      } else if (result.status === 204) {
        setVoucherMessageType('error')
        setVoucherMessage('Nenhum voucher disponível para este CPF.')
      } else {
        // 400 (ou 200 com isValid=false): inválido/expirado.
        setVoucherMessageType('error')
        setVoucherMessage(result.data?.message || 'Voucher inválido ou expirado.')
      }
    } catch (err) {
      console.error('Erro ao validar voucher manual:', err)
      setVoucherMessageType('error')
      setVoucherMessage('Não conseguimos validar agora, tente de novo.')
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
          // Capturados de verdade no formulário (captação mínima).
          name: data.name,
          cpf: data.cpf,
          birthDate: data.birthDate,
          email: data.email,
          phone: data.phone,
          // Administrativos NÃO capturados — valor padrão válido em formato;
          // a Cogna confirma os dados reais na matrícula efetiva.
          gender: DADOS_ADMIN_PADRAO.gender,
          schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
          rg: DADOS_ADMIN_PADRAO.rg,
          address: DADOS_ADMIN_PADRAO.address,
          addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
          neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
          city: DADOS_ADMIN_PADRAO.city,
          state: DADOS_ADMIN_PADRAO.state,
          cep: DADOS_ADMIN_PADRAO.cep,
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

      // Fail-fast: backend exige idDMH não-vazio (@IsNotEmpty). Se a oferta vier
      // sem dmhId, evitar chamar a API com payload inválido.
      if (!offerDetails.dmhId) {
        console.error('Oferta sem dmhId — não é possível criar inscrição', {
          courseId: offerDetails.courseId,
          unitId: offerDetails.unitId,
          brand: offerDetails.brand,
          modality: offerDetails.modality,
          dmhSource: offerDetails.dmhSource,
          idDmhElastic: offerDetails.idDmhElastic,
        })
        // Falha ANTES da Cogna, e igualmente cara: o candidato preencheu tudo e
        // não vira inscrição. Sem este report ela não aparecia em lugar nenhum
        // (só console.error) e o funil contabilizava como abandono comum.
        trackEvent('checkout_inscription_failed', {
          course_id: offerDetails.courseId,
          course_name: offerDetails.course,
          brand: offerDetails.brand,
          modality: offerDetails.modality,
          dmh_source: offerDetails.dmhSource?.source,
          error_message: 'oferta sem dmhId',
          cogna_known_error: false,
        })
        reportInscriptionFailure({
          flow: 'matricula',
          cpf: data.cpf,
          name: data.name,
          email: data.email,
          phone: data.phone,
          courseName: offerDetails.course,
          courseId: offerDetails.courseId,
          brand: offerDetails.brand,
          modalidade: offerDetails.modality,
          city: offerDetails.unitCity,
          source: offerDetails.dmhSource?.source,
          errorMessage: 'oferta sem dmhId',
        })
        toast.error('Essa oferta não está disponível para inscrição no momento. Tente outra unidade ou volte mais tarde.')
        return
      }

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
          // Privacidade: nunca enviar email/CPF crus como propriedade de evento —
          // só flags. O contato real vai como person properties no identifyUser abaixo.
          has_email: !!data.email && data.email.includes('@'),
          has_cpf: data.cpf.replace(/\D/g, '').length === 11,
          amount_paid: 0,
          promoter_id: promoterId,
        })
        
        // Identificar usuário no PostHog
        identifyUser(data.cpf.replace(/\D/g, ''), {
          email: data.email,
          name: data.name,
          phone: data.phone.replace(/\D/g, ''),
        })

        // PostHog server-side (enrollment_completed_server):
        // marca o contato como "inscrito" e mede a conversão real independente
        // de consentimento de cookie. Não-bloqueante.
        fetch('/api/leads/confirm-inscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone.replace(/\D/g, ''),
            cpf: data.cpf.replace(/\D/g, ''),
            courseName: offerDetails?.course,
            courseId: offerDetails?.courseId,
            brand: offerDetails?.brand,
            modalidade: offerDetails?.modality,
            city: offerDetails?.unitCity,
            source: offerDetails?.dmhSource?.source,
            inscriptionId: response.id,
            // Turno e valores da oferta: sem eles a mensagem de recuperação
            // não consegue dizer o que a pessoa está prestes a perder
            // ("R$ 108,38 em Nutrição, no polo X"), que é o que faz ela voltar.
            shift: offerDetails?.shift,
            monthlyPrice: offerDetails?.montlyFeeTo,
            enrollmentFee: offerDetails?.subscriptionValue,
          }),
        }).catch((e) => console.error('Confirmação de inscrição falhou:', e))

        // O marcador "Pendente Pagamento" saiu em 2026-08-11 junto com o CRM
        // (troca de fornecedor). Ele distinguia a graduação EAD/semi ATHENAS,
        // que por decisão de negócio não é cobrada no site — a Cogna cobra
        // depois pelo payment-link dela. Sinal a reconstruir no CRM novo.

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
                ...readUtmifyParams(),
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
          // Kill switch (decisão de negócio, 2026-08): createMarketplaceInscription
          // está DESATIVADA — ela duplicava a inscrição na Cogna para ofertas
          // ATHENAS (uma via createInscription normal, acima, + outra via
          // marketplace/canalVendas.id=141). Nasce OFF; religa subindo a flag
          // PostHog 'marketplace_enabled' pra 100% (mesma flag do lado servidor,
          // em confirm-matricula.ts). NÃO apagar createMarketplaceInscription
          // nem o endpoint — só parar de chamar enquanto a flag está off.
          if (marketplaceEnabled) {
            console.log('📝 Criando inscrição no marketplace ATHENAS...')
            try {
              const marketplaceResult = await createMarketplaceInscription(
                {
                  // Capturados de verdade no formulário (captação mínima).
                  name: data.name,
                  cpf: data.cpf,
                  email: data.email,
                  phone: data.phone,
                  birthDate: data.birthDate,
                  // Administrativos NÃO capturados — valor padrão válido em
                  // formato; a Cogna confirma os dados reais na matrícula efetiva.
                  rg: DADOS_ADMIN_PADRAO.rg,
                  gender: DADOS_ADMIN_PADRAO.gender,
                  cep: DADOS_ADMIN_PADRAO.cep,
                  address: DADOS_ADMIN_PADRAO.address,
                  addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
                  neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
                  city: DADOS_ADMIN_PADRAO.city,
                  state: DADOS_ADMIN_PADRAO.state,
                  ingressType: selectedIngressType,
                  schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
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

          // Funil unificado — etapa 3 (ramo graduação/ATHENAS). Fica FORA do
          // gate acima de propósito: o candidato enviou o checkout independente
          // de a chamada ao marketplace estar ligada ou não — não queremos que
          // desativar o marketplace crie um ponto cego no funil de conversão.
          trackCheckoutSubmitted(trackEvent, {
            flow: 'matricula',
            academicLevel: offerDetails.academicLevel,
            brand: offerDetails.brand,
            modality: offerDetails.modality,
            courseId: offerDetails.courseId,
            courseName: offerDetails.course,
          })
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
        const hasPlans =
          (level === 'POS_GRADUACAO' || level === 'CURSO_PROFISSIONALIZANTE')
          && (offerDetails.paymentMethods?.length ?? 0) > 0
        // Id da inscrição no parceiro: é com ele que a tela de sucesso gera o
        // link de pagamento da Cogna (passo 7). Sem ele o candidato termina o
        // fluxo sem nenhum caminho para pagar — que era o comportamento até
        // 2026-08-24. Vale para graduação E pós: nos dois a inscrição é criada
        // com `response.id`, e o payment-link gera o checkout. A diferença fica
        // na tela de sucesso — pós embuti em iframe (kroton.platosedu.io),
        // graduação abre em nova aba (pay.anhanguera.com bloqueia embed).
        if (response.id) {
          params.set('inscriptionId', String(response.id))
        }
        if (!hasPlans) {
          // Graduação (ou nível sem planos retornados): mensalidade direto à instituição
          params.set('monthlyFee', String(monthlyFee))
          params.set('installmentDescription', `Mensalidade ${formatCurrency(monthlyFee)}/mês`)
        } else {
          // Pós e profissionalizante: opção de pagamento escolhida + valor da parcela como monthlyFee
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
      const cognaMsg = getCognaErrorMessage(error)
      // Sinal no funil: sem isso a falha era invisível no PostHog e só
      // aparecia como re-submits (38 submits de 8 pessoas em jul/2026).
      const errorDetails = getCognaErrorDetails(error)
      trackEvent('checkout_inscription_failed', {
        course_id: offerDetails?.courseId,
        course_name: offerDetails?.course,
        brand: offerDetails?.brand,
        modality: offerDetails?.modality,
        dmh_source: offerDetails?.dmhSource?.source,
        error_message: cognaMsg ?? (error instanceof Error ? error.message : String(error)),
        cogna_known_error: cognaMsg != null,
        // Mensagens da Cogna são genéricas ("Não foi possível criar a
        // inscrição") — a causa real vem no corpo/status da resposta.
        error_status: errorDetails.status,
        error_body: errorDetails.body,
      })

      // Mesmo sinal, porém server-to-server: o trackEvent acima só existe se a
      // pessoa aceitou o banner de cookie (quase ninguém no checkout aceita),
      // então sozinho ele deixava a recusa da Cogna invisível — sem CPF, sem
      // nome, sem motivo. Este report não depende de consent e é o que permite
      // reconciliar as inscrições recusadas com o parceiro.
      reportInscriptionFailure({
        flow: 'matricula',
        cpf: data.cpf,
        name: data.name,
        email: data.email,
        phone: data.phone,
        courseName: offerDetails?.course,
        courseId: offerDetails?.courseId,
        brand: offerDetails?.brand,
        modalidade: offerDetails?.modality,
        city: offerDetails?.unitCity,
        source: offerDetails?.dmhSource?.source,
        errorMessage: cognaMsg ?? (error instanceof Error ? error.message : String(error)),
        errorStatus: errorDetails.status,
        errorBody: errorDetails.body,
        cognaKnownError: cognaMsg != null,
      })

      toast.error(cognaMsg ?? 'Erro ao finalizar matrícula. Entre em contato com o suporte.')
    }
  }

  const onSubmit = async (data: FormSchema) => {
    // Validar CPF antes de prosseguir
    if (cpfValidationError) {
      toast.error('Por favor, corrija o CPF antes de continuar.')
      return
    }

    // Trava de CPF já inscrito na Cogna — defesa em profundidade (o botão já
    // vem desabilitado nesse estado, mas o form pode ser submetido por
    // outros meios, ex. Enter).
    if (cpfInscriptionBlocked) {
      toast.error(cpfInscriptionBlocked)
      return
    }

    if (!offerDetails) {
      toast.error('Detalhes da oferta não encontrados.')
      return
    }

    // Domínio sem MX não recebe e-mail nenhum — erro comprovado, não
    // suspeita. A criação da inscrição (Cogna, via Tartarus) acontece direto
    // do browser mais abaixo, sem passar pela nossa API — esta é a checagem
    // de servidor que gateia o cadastro antes disso. Fail-open embutido: só
    // bloqueia quando a consulta DNS PROVA que o domínio não tem MX; timeout
    // ou erro de rede deixa passar (ver app/lib/validation/email-mx.ts e
    // app/lib/api/validate-email.ts).
    const emailCheck = await validateEmailDeliverability(data.email)
    if (!emailCheck.ok) {
      toast.error(emailCheck.error ?? 'Não conseguimos validar esse e-mail. Confira se está correto.')
      return
    }

    // Pós e Profissionalizante: validar parcela selecionada e salvar no localStorage
    if (hasPaymentPlans) {
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

      const isPosGraduacao = offerDetails.academicLevel === 'POS_GRADUACAO'
      const hasValidVoucher = !!(voucherCode.trim() && voucherValid && voucherData)

      // Pós-graduação: o voucher GALENA+15 é obrigatório (aplicado sozinho, ver
      // useEffect acima) e a Cogna exige `paymentMethod.voucher` como string
      // sempre que `paymentMethod` é enviado. Sem voucher confirmado, não crie
      // a inscrição — é a corrida de tempo do 400 relatado no PostHog.
      if (isPosGraduacao && !hasValidVoucher) {
        trackEvent('pos_voucher_indisponivel', {
          course_id: offerDetails.courseId,
          academic_level: offerDetails.academicLevel,
          was_still_validating: posVoucherAutoValidating,
        })
        toast.error('Não conseguimos aplicar as condições da sua oferta agora. Tente novamente em instantes.')
        return
      }

      if (typeof window !== 'undefined') {
        if (hasValidVoucher) {
          const pmData: { id: string; dueDay: string; voucher: string; voucherId?: number } = {
            id: posInstallmentId,
            dueDay: '10',
            voucher: voucherData!.code || voucherCode.trim(),
            voucherId: voucherData!.id,
          }
          localStorage.setItem('pendingPosPaymentMethod', JSON.stringify(pmData))
        } else {
          // Profissionalizante sem voucher: o voucher é opcional aqui, mas a
          // mesma API rejeita `paymentMethod` sem `voucher` (string obrigatória
          // quando o campo existe). Não há confirmação no código de qual é o
          // comportamento correto sem voucher — a opção conservadora é não
          // mandar `paymentMethod` nenhum (ver createInscriptionAfterPayment,
          // que trata a ausência dessa chave no localStorage como "sem
          // paymentMethod"), em vez de arriscar o mesmo 400.
          localStorage.removeItem('pendingPosPaymentMethod')
        }
      }
    }

    trackEvent('checkout_inscription_submitted', {
      course_id: offerDetails.courseId,
      course_name: offerDetails.course,
    })

    // Funil unificado — etapa 3 (ramo pós/profissionalizante)
    trackCheckoutSubmitted(trackEvent, {
      flow: 'matricula',
      academicLevel: offerDetails.academicLevel,
      brand: offerDetails.brand,
      modality: offerDetails.modality,
      courseId: offerDetails.courseId,
      courseName: offerDetails.course,
    })

    // Facebook Pixel + Conversions API - CompleteRegistration (com Advanced Matching)
    void trackFbqDual(
      'CompleteRegistration',
      {
        content_name: offerDetails.course,
        content_ids: offerDetails.courseId ? [String(offerDetails.courseId)] : undefined,
        content_type: 'product',
        value: offerDetails.montlyFeeTo || 0,
        currency: 'BRL',
      },
      {
        email: data.email,
        phone: data.phone,
        externalId: data.cpf.replace(/\D/g, ''),
      },
    )

    // TikTok Pixel + Events API - CompleteRegistration (com Advanced Matching)
    void trackTikTokDual(
      'CompleteRegistration',
      {
        content_id: offerDetails.courseId,
        content_name: offerDetails.course,
        content_type: 'product',
        value: offerDetails.montlyFeeTo || 0,
        currency: 'BRL',
      },
      {
        email: data.email,
        phone: data.phone,
        externalId: data.cpf.replace(/\D/g, ''),
      },
    )

    // Graduação EAD/semi ATHENAS não cobra mais no site (decisão de negócio —
    // Cogna cobra depois via payment-link deles): cria a inscrição direto,
    // igual aos outros níveis que já não coletavam pagamento aqui.
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

    const SkeletonBlock = ({ className = '' }: { className?: string }) => (
      <div className={`animate-pulse bg-paper-warm rounded-xl ${className}`} />
    )

    return (
      <div className="min-h-screen bg-paper pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/curso/resultado"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors mb-6"
          >
            <ArrowLeft size={12} />
            Voltar
          </Link>

          <div className="pt-2 mb-8">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-ink-300" />
              Inscrição · Bolsa Click
            </span>
            {cachedCourse?.name ? (
              <>
                <h1 className="font-display text-3xl md:text-[40px] font-semibold text-ink-900 leading-tight">
                  Checkout{' '}
                  <span className="italic text-ink-700">
                    {cachedCourse.brand || cachedCourse.name}
                  </span>
                </h1>
                <p className="text-ink-500 text-[14px] mt-2 inline-flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-bolsa-secondary border-t-transparent animate-spin" />
                  Carregando {cachedCourse.name}…
                </p>
              </>
            ) : (
              <>
                <SkeletonBlock className="h-10 w-72 mb-2" />
                <SkeletonBlock className="h-4 w-48" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Skeleton do form (esquerda) */}
            <div className="bg-white border border-hairline rounded-2xl p-6 space-y-4">
              <div className="flex items-baseline justify-between hairline-b pb-3">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-11" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-11" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-11" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-11" />
                </div>
                <div className="col-span-2 space-y-2">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="h-11" />
                </div>
              </div>
              <div className="hairline-t pt-4">
                <SkeletonBlock className="h-12 w-full" />
              </div>
            </div>

            {/* Skeleton da sidebar de detalhes do curso */}
            <aside className="bg-white border border-hairline rounded-2xl p-6 md:p-7 h-fit">
              <div className="hairline-b pb-5 mb-5">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-2">
                  <BookOpen size={11} />
                  Detalhes do curso
                </span>
                {cachedCourse?.name ? (
                  <h2 className="font-display text-2xl text-ink-900 leading-tight">
                    {cachedCourse.name}
                  </h2>
                ) : (
                  <SkeletonBlock className="h-8 w-3/4" />
                )}
              </div>

              {cachedCourse?.minPrice ? (
                <div className="bg-paper-warm border border-hairline rounded-2xl p-5 mb-5">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2 block">
                    Mensalidade com bolsa
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] text-ink-700 font-medium">R$</span>
                    <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                      {cachedCourse.minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[12px] text-ink-500">/mês</span>
                  </div>
                  <p className="text-[11px] text-ink-500 mt-3 italic inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-bolsa-secondary animate-pulse" />
                    Confirmando valores com a instituição…
                  </p>
                </div>
              ) : (
                <div className="bg-paper-warm border border-hairline rounded-2xl p-5 mb-5">
                  <SkeletonBlock className="h-3 w-32 mb-3" />
                  <SkeletonBlock className="h-10 w-40 mb-2" />
                  <SkeletonBlock className="h-3 w-48" />
                </div>
              )}

              <div className="space-y-2.5 hairline-b pb-5 mb-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-4 w-full" />
                ))}
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-3 w-5/6" />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  }

  if (error || !offerDetails) {
    return (
      <div className="min-h-screen bg-paper pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/curso/resultado"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors mb-6"
          >
            <ArrowLeft size={12} />
            Voltar
          </Link>
          <div className="bg-white border border-hairline rounded-2xl p-6 md:p-8">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary mb-3 block">
              Erro
            </span>
            <h1 className="font-display text-2xl md:text-[28px] text-ink-900 leading-tight mb-3">
              Não foi possível{' '}
              <span className="italic text-ink-700">carregar os detalhes.</span>
            </h1>
            <p className="text-[14px] text-ink-500 mb-6 leading-relaxed">
              {error?.message || 'Tente novamente ou volte para busca.'}
            </p>
            <button
              onClick={() => router.push('/curso/resultado')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] transition-colors"
            >
              Voltar para busca
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pt-20 md:pt-24">
      <div className="max-w-6xl w-full mx-auto px-4 pb-12 md:pb-16">
        <Link
          href="/curso/resultado"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors mb-6"
        >
          <ArrowLeft size={12} />
          Voltar
        </Link>

        {/* Header */}
        <header className="mb-8 md:mb-10">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-ink-300" />
            Inscrição · {offerDetails.brand}
          </span>
          <h1 className="font-display text-3xl md:text-[40px] font-semibold text-ink-900 leading-[1.1]">
            Garanta sua bolsa{' '}
            <span className="italic text-ink-700">em poucos passos.</span>
          </h1>
          <p className="text-ink-500 text-[14px] md:text-[15px] mt-3 leading-relaxed max-w-2xl">
            Complete seus dados pra finalizar a matrícula. O valor da matrícula e das mensalidades é pago diretamente à instituição.
          </p>

          {/* Stepper editorial — sincronizado com as 3 sections do form */}
          {(() => {
            const dadosOk = !!(
              watchedValues.email &&
              watchedValues.name &&
              cpfValidationOk
            )
            const contatoOk = !!watchedValues.phone
            const steps = [
              { n: '01', label: 'Estudante', done: dadosOk, active: !dadosOk },
              { n: '02', label: 'Contato', done: contatoOk, active: dadosOk && !contatoOk },
              { n: '03', label: 'Pagamento', done: false, active: dadosOk && contatoOk },
            ]
            return (
              <ol
                className="mt-8 flex items-center gap-3 md:gap-4 text-[11px] md:text-[12px]"
                aria-label="Etapas do checkout"
              >
                {steps.map((step, idx, arr) => {
                  const visible = step.active || step.done
                  return (
                    <li key={step.n} className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`flex items-center gap-2.5 ${
                          visible ? 'text-ink-900' : 'text-ink-300'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full font-mono num-tabular text-[10px] tracking-wider transition-colors ${
                            step.done
                              ? 'bg-bolsa-secondary text-white'
                              : step.active
                              ? 'bg-ink-900 text-white'
                              : 'bg-white border border-hairline text-ink-500'
                          }`}
                        >
                          {step.done ? <Check size={12} strokeWidth={3} /> : step.n}
                        </span>
                        <span className="font-mono uppercase tracking-[0.18em] font-medium hidden sm:inline">
                          {step.label}
                        </span>
                      </div>
                      {idx < arr.length - 1 && (
                        <span
                          className={`h-px w-8 md:w-12 transition-colors ${
                            step.done ? 'bg-ink-900' : 'bg-hairline'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  )
                })}
              </ol>
            )
          })()}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-7 bg-white border border-hairline rounded-2xl overflow-hidden shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)]">
            {/* Banner mostrando que está logado */}
            {user && (
              <div className="bg-paper-warm border-b border-hairline px-6 py-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'Avatar'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 bg-ink-900 rounded-full flex items-center justify-center ring-2 ring-white">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink-900 leading-tight">
                      Olá, {user.name?.split(' ')[0] || 'Usuário'}.
                    </p>
                    <p className="text-[12px] text-ink-500 mt-0.5">
                      Seus dados foram preenchidos automaticamente.
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bolsa-secondary text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Dados do Aluno - Seção Expansível */}
              <div className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => toggleSection('dadosPessoais')}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-paper-warm/40 transition-colors"
                  aria-expanded={expandedSections.dadosPessoais}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-ink-900 flex-shrink-0">
                      <User size={15} />
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5 block">
                        01 · Estudante
                      </span>
                      <h2 className="font-display text-[18px] text-ink-900 leading-tight">
                        Dados do aluno
                      </h2>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all ${
                      expandedSections.dadosPessoais ? 'rotate-180 border-ink-900 text-ink-900' : ''
                    }`}
                  >
                    <ChevronDown size={14} />
                  </span>
                </button>
                {expandedSections.dadosPessoais && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5">
                          <Mail size={14} className="inline mr-1" /> E-mail
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          {...register('email')}
                          placeholder="seuemail@exemplo.com"
                          className="w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        {!errors.email && emailTypoSuggestion && (
                          <p className="text-amber-600 text-xs mt-1">
                            Você quis dizer{' '}
                            <button
                              type="button"
                              className="underline font-medium hover:text-amber-700"
                              onClick={() => setValue('email', emailTypoSuggestion, { shouldValidate: true })}
                            >
                              {emailTypoSuggestion}
                            </button>
                            ?
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5">Nome Completo</label>
                        <input
                          type="text"
                          autoComplete="name"
                          {...register('name')}
                          placeholder="Ex: Rodrigo Silva"
                          className="w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5">CPF</label>
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
                                  if (cpfInscriptionBlocked) setCpfInscriptionBlocked(null)
                                }}
                                onBlur={async (e) => {
                                  field.onBlur()
                                  const cleanCpf = e.target.value.replace(/\D/g, '')
                                  if (cleanCpf.length === 11 && validarCPF(cleanCpf)) {
                                    setIsValidatingCpf(true)
                                    setCpfValidationError(null)
                                    setCpfValidationOk(false)
                                    setCpfInscriptionBlocked(null)
                                    try {
                                      // Consulta se o CPF já existe no banco — só alimenta o
                                      // tracking; a matrícula não exige conta.
                                      const dbCheckResponse = await fetch('/api/auth/check-cpf', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ cpf: cleanCpf }),
                                      })
                                      const dbCheckResult = await dbCheckResponse.json()

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

                                      // Funil unificado — etapa 2: contato já
                                      // preenchido + CPF validado. Identifica a
                                      // pessoa no PostHog (tira do anonimato →
                                      // habilita retargeting de quem NÃO concluir).
                                      trackCheckoutIdentified(
                                        trackEvent,
                                        {
                                          flow: 'matricula',
                                          academicLevel: offerDetails?.academicLevel,
                                          brand: offerDetails?.brand,
                                          modality: offerDetails?.modality,
                                          courseId: offerDetails?.courseId,
                                          courseName: offerDetails?.course,
                                          email: getValues('email') || undefined,
                                          phone: getValues('phone') || undefined,
                                          name: getValues('name') || undefined,
                                          // CPF já validado neste ponto: vira o
                                          // distinct_id AQUI, não só no sucesso —
                                          // é o que faz a falha da Cogna ter dono.
                                          cpf: cleanCpf,
                                        },
                                        setUserProperties,
                                        identifyUser,
                                      )

                                      // Facebook Pixel + Conversions API - AddPaymentInfo (dados pessoais preenchidos + CPF validado)
                                      void trackFbqDual(
                                        'AddPaymentInfo',
                                        {
                                          content_name: offerDetails?.course,
                                          content_ids: offerDetails?.courseId ? [String(offerDetails.courseId)] : undefined,
                                          content_type: 'product',
                                          value: offerDetails?.subscriptionValue || offerDetails?.montlyFeeTo || 0,
                                          currency: 'BRL',
                                        },
                                        {
                                          email: getValues('email') || undefined,
                                          phone: getValues('phone') || undefined,
                                          externalId: (getValues('cpf') || '').replace(/\D/g, '') || undefined,
                                        },
                                      )

                                      // GA4 ecommerce (dataLayer/GTM) - add_payment_info, paridade com o AddPaymentInfo acima.
                                      pushDataLayerEvent('add_payment_info', {
                                        ecommerce: {
                                          currency: 'BRL',
                                          value: offerDetails?.subscriptionValue || offerDetails?.montlyFeeTo || 0,
                                          items: [
                                            {
                                              item_id: offerDetails?.courseId ? String(offerDetails.courseId) : undefined,
                                              item_name: offerDetails?.course,
                                              item_brand: offerDetails?.brand,
                                            },
                                          ],
                                        },
                                      })

                                      // TikTok Pixel - AddPaymentInfo
                                      trackTikTok('AddPaymentInfo', {
                                        content_id: offerDetails?.courseId,
                                        content_name: offerDetails?.course,
                                        content_type: 'product',
                                        value: offerDetails?.subscriptionValue || offerDetails?.montlyFeeTo || 0,
                                        currency: 'BRL',
                                      })

                                      // Trava de CPF já inscrito (Cogna): GET can-create-inscription.
                                      // Isolada num try próprio — falha de rede/infra aqui NÃO bloqueia
                                      // o candidato (fail-open); a Cogna valida de novo, com força, no
                                      // create-inscription final.
                                      if (offerDetails?.dmhId) {
                                        try {
                                          const inscriptionCheck = await canCreateInscription(cleanCpf, offerDetails.dmhId)
                                          if (inscriptionCheck.inscriptionAllowed === false) {
                                            const blockedMessage =
                                              inscriptionCheck.message || 'Este CPF já possui uma inscrição ativa.'
                                            setCpfInscriptionBlocked(blockedMessage)
                                            toast.error(blockedMessage)
                                            trackEvent('cpf_inscription_blocked', {
                                              course_id: offerDetails?.courseId,
                                              course_name: offerDetails?.course,
                                            })
                                          }
                                        } catch (checkError: unknown) {
                                          console.error('Erro ao verificar inscrição existente na Cogna (fail-open, não bloqueia):', checkError)
                                        }
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
                                inputMode="numeric"
                                className={`w-full px-3 py-2 pr-9 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary ${
                                  cpfValidationError || cpfInscriptionBlocked
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
                                {!isValidatingCpf && cpfValidationOk && !cpfInscriptionBlocked && (
                                  <Check size={16} className="text-green-600" aria-label="CPF validado" />
                                )}
                              </div>
                              </div>
                              {isValidatingCpf && (
                                <p className="text-blue-500 text-xs mt-1">Validando CPF...</p>
                              )}
                              {!isValidatingCpf && cpfValidationOk && !cpfInscriptionBlocked && (
                                <p className="text-green-600 text-xs mt-1">CPF validado — você pode continuar.</p>
                              )}
                            </div>
                          )}
                        />
                        {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                        {cpfValidationError && <p className="text-red-500 text-xs mt-1">{cpfValidationError}</p>}
                        {cpfInscriptionBlocked && <p className="text-red-500 text-xs mt-1">{cpfInscriptionBlocked}</p>}
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5">
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
                              inputMode="numeric"
                              autoComplete="bday"
                              className="w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors"
                            />
                          )}
                        />
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contato - Seção Expansível */}
              <div className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    toggleSection('contato')
                    if (!expandedSections.contato) {
                      setTimeout(() => tryCreateStudent(), 100)
                    }
                  }}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-paper-warm/40 transition-colors"
                  aria-expanded={expandedSections.contato}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-ink-900 flex-shrink-0">
                      <MapPin size={15} />
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5 block">
                        02 · Contato
                      </span>
                      <h2 className="font-display text-[18px] text-ink-900 leading-tight">
                        Telefone
                      </h2>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all ${
                      expandedSections.contato ? 'rotate-180 border-ink-900 text-ink-900' : ''
                    }`}
                  >
                    <ChevronDown size={14} />
                  </span>
                </button>
                {expandedSections.contato && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5">
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
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            className="w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors"
                          />
                        )}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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

              {/* Forma de Pagamento - Seção Expansível */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('pagamento')}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-paper-warm/40 transition-colors"
                  aria-expanded={expandedSections.pagamento}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-ink-900 flex-shrink-0">
                      <CreditCard size={15} />
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5 block">
                        03 · Pagamento
                      </span>
                      <h2 className="font-display text-[18px] text-ink-900 leading-tight">
                        Confirmar inscrição
                      </h2>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all ${
                      expandedSections.pagamento ? 'rotate-180 border-ink-900 text-ink-900' : ''
                    }`}
                  >
                    <ChevronDown size={14} />
                  </span>
                </button>

                {expandedSections.pagamento && (
                  <div className="px-6 pb-6 space-y-4">
                    {/* Sem checkout: pós e profissionalizante mostram parcelas; graduação só botão */}
                    {hasPaymentPlans ? (
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
                                Vencimento: dia <strong>10</strong> de cada mês (definido pela instituição).
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-600 mt-3">
                            O valor da matrícula e das mensalidades será pago diretamente à instituição de ensino.
                          </p>

                          {/* Voucher — digitação manual liberada nos dois níveis Cosmos
                              (pós e profissionalizante); graduação (ATHENAS) não tem esse campo. */}
                          {showVoucherField && (
                          <div className="mt-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Possui um voucher?</label>
                            {/* Deixa claro qual desconto está valendo antes de a pessoa mexer no campo —
                                relevante sobretudo na pós, onde o GALENA+15 já pode estar aplicado sozinho. */}
                            {voucherValid && voucherCode && (
                              <p className="text-xs text-gray-500 mb-2">
                                {voucherCode === 'GALENA+15'
                                  ? 'Desconto automático GALENA+15 já aplicado.'
                                  : `Voucher ${voucherCode} aplicado.`}{' '}
                                Quer usar outro código? Digite abaixo — se for válido, ele substitui o atual.
                              </p>
                            )}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={voucherInputValue}
                                onChange={(e) => {
                                  setVoucherInputValue(e.target.value)
                                  setVoucherMessage('')
                                }}
                                placeholder="Digite o código do voucher"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleValidateVoucher}
                                disabled={voucherValidating || !voucherInputValue.trim()}
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
                              <p className={`text-xs mt-2 ${voucherMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {voucherMessage}
                              </p>
                            )}
                          </div>
                          )}

                          <button
                            type="submit"
                            disabled={
                              isSubmitting
                              || !posInstallmentId
                              || !!cpfInscriptionBlocked
                              || (offerDetails?.academicLevel === 'POS_GRADUACAO' && posVoucherAutoValidating)
                            }
                            className="checkout-step-cta group w-full mt-4 inline-flex items-center justify-center gap-3 bg-bolsa-secondary text-white py-4 px-6 rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 disabled:bg-ink-300 disabled:cursor-not-allowed shadow-lg shadow-bolsa-secondary/25 hover:shadow-bolsa-secondary/40 transition-all duration-300"
                          >
                            {isSubmitting ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processando…
                              </span>
                            ) : offerDetails?.academicLevel === 'POS_GRADUACAO' && posVoucherAutoValidating ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verificando condições…
                              </span>
                            ) : (
                              <>
                                Finalizar matrícula
                                <ArrowRight
                                  size={16}
                                  className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                              </>
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
                            className="checkout-step-cta group w-full inline-flex items-center justify-center gap-3 bg-bolsa-secondary text-white py-4 px-6 rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 disabled:bg-ink-300 disabled:cursor-not-allowed shadow-lg shadow-bolsa-secondary/25 hover:shadow-bolsa-secondary/40 transition-all duration-300"
                          >
                            {isSubmitting ? (
                              <span className="inline-flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processando…
                              </span>
                            ) : (
                              <>
                                Finalizar matrícula
                                <ArrowRight
                                  size={16}
                                  className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                              </>
                            )}
                          </button>
                        </>
                      )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Coluna Direita - Detalhes do Curso (DS editorial) */}
          <aside className="lg:col-span-5 bg-white border border-hairline rounded-2xl p-6 md:p-7 h-fit shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)] lg:sticky lg:top-24">
            {/* Eyebrow + Curso */}
            <div className="hairline-b pb-5 mb-5">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-2">
                <BookOpen size={11} />
                Detalhes do curso
              </span>
              <h2 className="font-display text-2xl text-ink-900 leading-tight">
                {offerDetails.course}
              </h2>
            </div>

            {/* Bloco de preço */}
            <div className="bg-paper-warm border border-hairline rounded-2xl p-5 mb-5 relative overflow-hidden">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2 block">
                Mensalidade com bolsa
              </span>

              {voucherValid && voucherInstallments.length > 0 ? (
                (() => {
                  const selectedOriginal = posInstallmentId
                    ? ((offerDetails.paymentMethods as PosPaymentMethod[])
                        .find((pm) => pm.type === posPaymentMethodType)
                        ?.installments?.find((i) => i.id === posInstallmentId))
                    : null
                  const selectedNumber = selectedOriginal?.number
                  const vInst = voucherInstallments.find((v) => v.number === selectedNumber) || voucherInstallments[0]
                  return (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[14px] text-ink-700 font-medium">R$</span>
                        <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                          {vInst.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[12px] text-ink-500">/mês</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[12px] text-ink-300 line-through num-tabular">
                          De {formatCurrency(vInst.originalInstallmentValue)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bolsa-secondary text-white text-[10px] font-bold tracking-wide">
                          Voucher −{vInst.discountPercentage}%
                        </span>
                      </div>
                    </>
                  )
                })()
              ) : !(voucherValid && voucherInstallments.length > 0) && offerDetails?.montlyFeeFrom && offerDetails.montlyFeeFrom > monthlyFee ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] text-ink-700 font-medium">R$</span>
                    <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                      {monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[12px] text-ink-500">/mês</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[12px] text-ink-300 line-through num-tabular">
                      De {formatCurrency(offerDetails.montlyFeeFrom)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bolsa-secondary text-white text-[10px] font-bold tracking-wide">
                      −{Math.round(((offerDetails.montlyFeeFrom - monthlyFee) / offerDetails.montlyFeeFrom) * 100)}%
                    </span>
                  </div>
                  {priceAnchor?.totalSavings != null && (
                    <p className="text-[11px] text-emerald-600 mt-1.5">
                      Economize {formatCurrency(priceAnchor.totalSavings)} até o fim do curso
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700 font-medium">R$</span>
                  <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                    {monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[12px] text-ink-500">/mês</span>
                </div>
              )}

              <p className="text-[11px] text-ink-500 mt-3 italic">
                Pago diretamente à instituição de ensino
              </p>
            </div>

            {/* Aviso "Matrícula e mensalidade na instituição" */}
            <div className="bg-bolsa-primary/5 border border-bolsa-primary/15 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-bolsa-primary text-white flex items-center justify-center font-bold text-[11px]">
                  i
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-ink-900 mb-1">
                    Matrícula e mensalidade na instituição
                  </p>
                  <p className="text-[12px] text-ink-500 leading-relaxed">
                    O valor da matrícula e das mensalidades será pago diretamente à instituição de ensino. Nenhuma taxa é cobrada neste checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata da oferta */}
            <ul className="space-y-2.5 hairline-b pb-5 mb-5">
              <li className="flex items-center gap-3 text-[13px] text-ink-700">
                <Building2 size={14} className="text-ink-300 flex-shrink-0" />
                <span className="font-medium text-ink-900">{offerDetails.brand}</span>
              </li>
              <li className="flex items-center gap-3 text-[13px] text-ink-700">
                <BookOpen size={14} className="text-ink-300 flex-shrink-0" />
                <span>{getModalityLabel(offerDetails.modality)}</span>
              </li>
              <li className="flex items-center gap-3 text-[13px] text-ink-700">
                <Clock size={14} className="text-ink-300 flex-shrink-0" />
                <span>{getShiftLabel(offerDetails.shift)}</span>
              </li>
              <li className="flex items-start gap-3 text-[13px] text-ink-700">
                <MapPin size={14} className="text-ink-300 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {offerDetails.unitCity}, {offerDetails.unitState}
                  {offerDetails.unit?.replace(/.*- /, '') ? ` · ${offerDetails.unit.replace(/.*- /, '')}` : ''}
                </span>
              </li>
            </ul>

            {/* Disclaimer do desconto */}
            <p className="text-[11px] text-ink-500 leading-relaxed mb-5">
              <span className="text-bolsa-secondary font-semibold">*</span> Desconto válido para todas as mensalidades, exceto rematrículas e dependências.
            </p>

            {/* Sinais de confiança */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-[12px] text-ink-700 leading-relaxed">
                <ShieldCheck size={14} className="text-ink-900 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-ink-900">Sem cobrança aqui.</strong> Você só paga matrícula e mensalidade à instituição.
                </span>
              </li>
              <li className="flex items-start gap-3 text-[12px] text-ink-700 leading-relaxed">
                <Award size={14} className="text-ink-900 flex-shrink-0 mt-0.5" />
                <span>Parceiro oficial das principais instituições de ensino do Brasil.</span>
              </li>
              <li className="flex items-start gap-3 text-[12px] text-ink-700 leading-relaxed">
                <Check size={14} className="text-ink-900 flex-shrink-0 mt-0.5" />
                <span>
                  Mais de <strong className="font-semibold num-tabular text-ink-900">1.000</strong> estudantes já garantiram bolsa pelo Bolsa Click.
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </div>

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
