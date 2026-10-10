'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  User,
} from 'lucide-react'
import QRCode from 'react-qr-code'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import { pushDataLayerEvent } from '@/app/lib/analytics/gtag'
import { createLead } from '@/app/lib/api/create-lead'
import { readUtmifyParams } from '@/app/lib/analytics/utmify-client'
import { titleCasePtBr } from '@/app/lib/utils/title-case'
import { getPriceAnchor } from '@/app/lib/utils/price-anchor'
import { formatCurrency } from '@/utils/fomartCurrency'
import {
  trackCheckoutViewed,
  trackCheckoutSubmitted,
  trackCheckoutIdentified,
  trackCheckoutError,
  reportInscriptionFailure,
} from '@/app/lib/analytics/checkout-funnel'
import {
  candidateSchema,
  CANDIDATE_DEFAULT_VALUES,
  maskCep,
  type CandidateData,
} from '@/app/lib/checkout/candidate'
import {
  buildAthenaEnrollment,
  CODIGO_VESTIBULAR_ENEM,
  estacioAddressError,
  estacioVisibleAddressFields,
  type EstacioAddressField,
} from '@/app/lib/checkout/partner-payload'
import { lookupCep, type CepLookupResult } from '@/app/lib/checkout/viacep'
import {
  BirthDateField,
  CpfField,
  EmailField,
  NameField,
  PhoneField,
  useCpfValidation,
} from '../_shared/CandidateFields'
import { useCheckoutSteps } from '../_shared/useCheckoutSteps'
import EstacioPayment, { type EstacioChargeContext } from './EstacioPayment'
import type { CreateEnrollmentInput } from '@/app/lib/api/athena-offers'
import { PAYMENTS_DISABLED } from '@/app/lib/checkout/payments-disabled'

/**
 * O que a Estácio exige além da captação mínima do candidato.
 *
 * Os 5 campos do candidato (nome, e-mail, CPF, nascimento, celular) vêm do
 * formulário único compartilhado com a Cogna (app/lib/checkout/candidate.ts +
 * _shared/CandidateFields.tsx). Aqui fica só o que é da Athena: endereço REAL
 * (ver o comentário de `EstacioAddress` em partner-payload.ts — nunca
 * DADOS_ADMIN_PADRAO), forma de ingresso e aceite dos termos.
 *
 * Gênero e RG saíram do formulário (out/2026): são opcionais no contrato da
 * Athena e já iam vazios para quem não preenchia. Um teste de regressão
 * (estacio-form.test.ts) falha se voltarem.
 */
interface FormState {
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  codFormaIngresso: number
  graduationYear: string
  acceptTerms: boolean
}

const initialForm: FormState = {
  zipCode: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  // 24 = Vestibular (Ingresso Simplificado) — default recomendado pela
  // própria Estácio no glossário (2026-07-23). Ver COD_FORMA_INGRESSO_GRADUACAO
  // em athena-api (cod-forma-ingresso.constants.ts) para o conjunto validado.
  codFormaIngresso: 24,
  graduationYear: '',
  acceptTerms: false,
}

/**
 * Opções de forma de ingresso pra graduação — codFormaIngresso Estácio/YDUQS.
 * Nunca incluir o código 1 ("Vestibular" puro): a Estácio confirmou por
 * e-mail (2026-07-22) que esse código não deve ser mostrado nem enviado.
 * MSV = Matrícula Sem Vestibular para Segunda Graduação — pra quem já tem
 * diploma de graduação e quer outro (confirmado pelo Rodrigo, 2026-07-23).
 * Externa = diploma de outra instituição; Interna = diploma pela própria
 * Estácio.
 */
const FORMA_INGRESSO_OPTIONS: { value: number; label: string; hint?: string }[] = [
  { value: 24, label: 'Vestibular (Ingresso Simplificado)', hint: 'Recomendado' },
  { value: CODIGO_VESTIBULAR_ENEM, label: 'Vestibular (ENEM)', hint: 'Uso minha nota do ENEM' },
  { value: 2, label: 'Transferência Externa', hint: 'Venho de outra faculdade' },
  { value: 4, label: 'Transferência Interna', hint: 'Já sou aluno Estácio' },
  { value: 6, label: 'Segundo Curso', hint: 'Já tenho graduação' },
  { value: 3, label: 'MSV - Externa', hint: 'Segunda graduação, diploma de outra faculdade' },
  { value: 5, label: 'MSV - Interna', hint: 'Segunda graduação, diploma pela própria Estácio' },
]

const inputClass =
  'w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors'
const labelClass =
  'block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5'

interface EstacioCheckoutClientProps {
  /**
   * Taxa da plataforma Bolsa Click, em CENTAVOS. Vem do server component
   * (page.tsx), que lê a constante do servidor — o cliente nunca calcula nem
   * envia esse valor: quem cobra é o /api/athena-checkout/charge, com o valor
   * dele. A prop existe só para a tela exibir o mesmo número que será cobrado.
   */
  taxaEmCentavos: number
}

export default function EstacioCheckoutClient({ taxaEmCentavos }: EstacioCheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { trackEvent, setUserProperties, identifyUser } = usePostHogTracking()

  const offer = useMemo(
    () => ({
      offerId: searchParams.get('offerId') ?? '',
      courseName: searchParams.get('courseName') ?? '',
      brand: searchParams.get('brand') ?? 'Estácio',
      modality: searchParams.get('modality') ?? '',
      price: Number(searchParams.get('price') ?? '0'),
      city: searchParams.get('city') ?? '',
      state: searchParams.get('state') ?? '',
      academicLevel: searchParams.get('academicLevel') ?? '',
      unitAddress: searchParams.get('unitAddress') ?? '',
      unitDistrict: searchParams.get('unitDistrict') ?? '',
      unitPostalCode: searchParams.get('unitPostalCode') ?? '',
      // Preço específico das formas de ingresso 2 (Transferência Externa) e 3
      // (MSV Externa) — regra da Estácio (2026-07-24): só essas duas têm preço
      // próprio na API de ofertas; formas 1/7/24 sempre usam o preço "price"
      // (default) acima. Opcionais: enquanto o athena-api não mandar esses 2
      // campos, o checkout cai graciosamente no preço único de sempre.
      // Forma de ingresso da LINHA de catálogo desta oferta (1, 2 ou 3). Define
      // quais opções podem ser oferecidas — ver `formasSuportadas` abaixo.
      codFormaIngressoOferta: searchParams.get('codFormaIngressoOferta')
        ? Number(searchParams.get('codFormaIngressoOferta'))
        : undefined,
      priceForma2: searchParams.get('priceForma2')
        ? Number(searchParams.get('priceForma2'))
        : undefined,
      priceForma3: searchParams.get('priceForma3')
        ? Number(searchParams.get('priceForma3'))
        : undefined,
      // Preço cheio ("de") e duração — pra ancoragem de preço (ver
      // app/lib/utils/price-anchor.ts). Opcionais: quando o card não manda
      // (ex.: oferta sem desconto real), o checkout mostra só o preço.
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      durationInMonths: searchParams.get('durationInMonths')
        ? Number(searchParams.get('durationInMonths'))
        : undefined,
    }),
    [searchParams],
  )

  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    city: searchParams.get('city') ?? '',
    state: searchParams.get('state') ?? '',
  }))

  // Formulário único do candidato — mesmo schema, mesmo modo de validação da
  // Cogna. `onTouched` + `field.ref` nos campos são o fix de 08/10: o erro
  // aparece ao sair do campo e o envio inválido foca o primeiro campo errado,
  // em vez de travar em silêncio.
  const {
    register,
    handleSubmit: handleCandidateSubmit,
    setValue,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CandidateData>({
    resolver: zodResolver(candidateSchema),
    mode: 'onTouched',
    defaultValues: CANDIDATE_DEFAULT_VALUES,
  })
  const candidateValues = watch()

  // Identificação no PostHog: no blur do CPF validado, como na Cogna — quem
  // desiste depois já sai do anonimato. `identifiedRef` evita um segundo
  // `checkout_identified` no envio.
  const identifiedRef = useRef(false)
  const identify = (cpf: string) => {
    if (identifiedRef.current) return
    identifiedRef.current = true
    trackCheckoutIdentified(
      trackEvent,
      {
        flow: 'estacio',
        checkoutFlow: 'estacio_checkout',
        brand: offer.brand,
        modality: offer.modality,
        offerId: offer.offerId,
        courseName: offer.courseName,
        email: getValues('email').trim() || undefined,
        phone: getValues('phone').replace(/\D/g, '') || undefined,
        name: getValues('name').trim() || undefined,
        cpf,
      },
      setUserProperties,
      identifyUser,
    )
  }
  const cpfCheck = useCpfValidation({
    onCheckError: (error) => trackCheckoutError(trackEvent, 'cpf_db_check', error, 'estacio_checkout'),
    onSideEffectError: (error) =>
      trackCheckoutError(trackEvent, 'cpf_validation_side_effects', error, 'estacio_checkout'),
    onValidated: ({ cpf }) => identify(cpf),
  })

  /** Candidato validado no envio — base do payload e dos pixels de conversão. */
  const candidateRef = useRef<CandidateData | null>(null)

  // Preço a exibir pra forma de ingresso selecionada (regra da Estácio,
  // 2026-07-24): forma 2 e 3 usam preço próprio quando disponível; forma
  // 1/7/24 (e 4/5/6, não cobertas pela regra — sem dado melhor, mesmo
  // tratamento) usam o preço default. Sempre cai no preço único de "offer.price"
  // quando o campo específico não vier (compatível com o contrato de hoje).
  const displayPrice = useMemo(() => {
    if (form.codFormaIngresso === 2 && offer.priceForma2 !== undefined) {
      return offer.priceForma2
    }
    if (form.codFormaIngresso === 3 && offer.priceForma3 !== undefined) {
      return offer.priceForma3
    }
    return offer.price
  }, [form.codFormaIngresso, offer])

  // Ancoragem de preço (riscado + % + economia total) só faz sentido pro
  // preço default: offer.maxPrice é o "de" da forma padrão (1/7/24/4/5/6).
  // Formas 2/3 têm preço próprio sem "de" correspondente — não inventamos
  // desconto pra elas.
  const priceAnchor = useMemo(() => {
    if (displayPrice !== offer.price) return null
    return getPriceAnchor({
      from: offer.maxPrice,
      to: offer.price,
      durationMonths: offer.durationInMonths,
    })
  }, [displayPrice, offer])

  /**
   * Formas de ingresso que ESTA oferta suporta de verdade.
   *
   * A YDUQS não busca a oferta por id — ela busca por um conjunto de
   * propriedades que INCLUI a forma de ingresso. Oferecer uma forma sem linha
   * de catálogo correspondente devolve MS004 ("oferta não encontrada") e a
   * inscrição morre.
   *
   * O catálogo da Estácio só publica linhas para as formas 1, 2 e 3. As formas
   * 24 (Simplificado) e 7 (ENEM) não são linhas próprias: a YDUQS as resolve
   * como a família {1,7,24} sobre a linha de forma 1. Já 4, 5 e 6 são enviados
   * literalmente e não têm linha nenhuma — nas duas tentativas com 6, as duas
   * falharam com MS004.
   *
   * Até 2026-08-19 esta lista assumia que 24/7/4/5/6 estavam sempre
   * disponíveis. Para uma oferta publicada só como Transferência Externa
   * (forma 2), o candidato aceitava o padrão 24 e caía em MS004 — 7 de 8 casos
   * medidos. Agora a lista parte da forma da própria oferta.
   *
   * Sem o parâmetro (link antigo, já indexado) assume-se a forma 1, que é o
   * comportamento anterior — não vale quebrar quem chega por um link velho.
   */
  const formasSuportadas = useMemo(() => {
    const base = offer.codFormaIngressoOferta ?? 1
    const formas = new Set<number>()
    if (base === 1) {
      formas.add(24)
      formas.add(CODIGO_VESTIBULAR_ENEM)
    } else {
      formas.add(base)
    }
    // 2 e 3 entram quando o catálogo mandou preço próprio pra elas — é a prova
    // de que a linha existe para este grupo de oferta.
    if (offer.priceForma2 !== undefined) formas.add(2)
    if (offer.priceForma3 !== undefined) formas.add(3)
    return formas
  }, [offer.codFormaIngressoOferta, offer.priceForma2, offer.priceForma3])

  const visibleFormaIngressoOptions = useMemo(
    () => FORMA_INGRESSO_OPTIONS.filter((option) => formasSuportadas.has(option.value)),
    [formasSuportadas],
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /**
   * Etapa da tela. `form` = dados do candidato; `payment` = cobrança da taxa
   * da plataforma; `institution` = pagamento da matrícula NA ESTÁCIO — ao
   * contrário da Cogna, o `paymentUrl`/`pixCode` já vêm na PRÓPRIA resposta
   * que confirma a inscrição (não tem lookup assíncrono separado), então dá
   * pra mostrar de imediato, sem polling. A inscrição na Estácio NÃO
   * acontece na tela — ela roda no servidor, depois que a NOSSA cobrança
   * confirma (confirm-estacio.ts), justamente pra ninguém ser inscrito sem
   * pagar a taxa nem pagar a taxa sem ser inscrito.
   *
   * O que muda aqui (2026-09-10): antes, depois de pagar a taxa, o
   * candidato ia direto pra uma página de "sucesso" que só ENTÃO mostrava o
   * pagamento da matrícula na Estácio — dava a impressão de ter sido
   * inscrito antes de pagar o curso. Agora esse pagamento é o próximo passo
   * DESTA MESMA tela, antes de qualquer tela de "sucesso" aparecer.
   */
  const [stage, setStage] = useState<'form' | 'payment' | 'institution'>('form')
  const [chargeContext, setChargeContext] = useState<EstacioChargeContext | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  /**
   * Dados de pagamento da matrícula na Estácio + a URL de sucesso pra onde
   * navegamos quando o candidato terminar (ou pular) esse passo.
   */
  const [institutionPayment, setInstitutionPayment] = useState<{
    successUrl: string
    paymentUrl: string | null
    pixCode: string | null
    amount: string | null
    dueDate: string | null
  } | null>(null)
  const [institutionPixCopied, setInstitutionPixCopied] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  // Resultado da consulta do CEP digitado. Decide quais campos de endereço
  // aparecem (ver `estacioVisibleAddressFields`). `forceAddressReveal` abre os
  // quatro quando o envio acusa falta num campo que estava escondido.
  const [cepLookup, setCepLookup] = useState<CepLookupResult | null>(null)
  const [forceAddressReveal, setForceAddressReveal] = useState(false)
  const latestCepRef = useRef('')
  const [expanded, setExpanded] = useState({
    dados: true,
    endereco: false,
    ingresso: false,
  })

  const toggleSection = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    // Meta — InitiateCheckout. Faltava: o checkout Estácio só emitia `Lead`, no
    // fim, então tudo que acontecia entre abrir e concluir era invisível para a
    // Meta. Sem esta etapa não dá para medir onde o funil pago vaza, e é
    // justamente ela que tem volume suficiente para a campanha aprender.
    void trackFbqDual(
      'InitiateCheckout',
      {
        content_name: offer.courseName,
        content_ids: offer.offerId ? [String(offer.offerId)] : undefined,
        content_type: 'product',
        currency: 'BRL',
      },
      undefined,
      // Um InitiateCheckout por oferta por carregamento. Sem id estável a Meta
      // contaria de novo a cada recarga da página.
      offer.offerId ? `estacio_ic_${offer.offerId}` : undefined,
    )

    trackEvent('estacio_checkout_viewed', {
      offer_id: offer.offerId,
      course_name: offer.courseName,
      brand: offer.brand,
      modality: offer.modality,
      price: offer.price,
    })

    // Funil unificado — etapa 1 (fluxo Estácio)
    trackCheckoutViewed(trackEvent, {
      flow: 'estacio',
      checkoutFlow: 'estacio_checkout',
      brand: offer.brand,
      modality: offer.modality,
      offerId: offer.offerId,
      courseName: offer.courseName,
    })

    // GA4 ecommerce (dataLayer/GTM) - begin_checkout, paridade com o estacio_checkout_viewed acima.
    pushDataLayerEvent('begin_checkout', {
      ecommerce: {
        currency: 'BRL',
        value: offer.price || 0,
        items: [
          {
            item_id: offer.offerId ? String(offer.offerId) : undefined,
            item_name: offer.courseName,
            item_brand: offer.brand,
          },
        ],
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // O padrão do formulário é 24, que vale para a maioria das ofertas mas não
  // para todas: numa linha de catálogo publicada só como Transferência Externa
  // (forma 2), enviar 24 devolve MS004 e a inscrição morre. Quando o padrão não
  // está entre as formas suportadas, cai na primeira que a oferta aceita.
  useEffect(() => {
    if (visibleFormaIngressoOptions.length === 0) return
    if (formasSuportadas.has(form.codFormaIngresso)) return
    setForm((prev) => ({ ...prev, codFormaIngresso: visibleFormaIngressoOptions[0].value }))
  }, [formasSuportadas, visibleFormaIngressoOptions, form.codFormaIngresso])

  // ViaCEP é CAMINHO CRÍTICO aqui: o formulário só pede CEP + número e é ele
  // quem preenche logradouro, bairro, cidade e UF. Consulta ao completar os 8
  // dígitos (não no blur — o candidato vai direto para o número). Se falhar ou
  // vier incompleto, os campos que faltam APARECEM para preenchimento manual:
  // ViaCEP fora do ar não pode travar a inscrição (ver viacep.ts).
  const handleCepChange = async (raw: string) => {
    const masked = maskCep(raw)
    const digits = masked.replace(/\D/g, '')
    const changed = digits !== latestCepRef.current
    latestCepRef.current = digits
    setForm((prev) => ({
      ...prev,
      zipCode: masked,
      // CEP novo invalida o endereço que veio do anterior.
      ...(changed ? { street: '', neighborhood: '' } : {}),
    }))
    if (!changed) return
    setCepLookup(null)
    if (digits.length !== 8) {
      // Uma consulta anterior pode estar em voo: o resultado dela vai ser
      // descartado, então o spinner não pode ficar esperando por ela.
      setCepLoading(false)
      return
    }

    setCepLoading(true)
    const result = await lookupCep(digits)
    // Resposta de um CEP que o candidato já trocou: descarta.
    if (latestCepRef.current !== digits) return
    setCepLoading(false)
    setCepLookup(result)
    if (result.ok) {
      setForm((prev) => ({ ...prev, ...result.address }))
    } else {
      trackCheckoutError(trackEvent, 'cep_autofill', new Error(`viacep_${result.reason}`), 'estacio_checkout')
    }
  }

  const visibleAddressFields: EstacioAddressField[] = forceAddressReveal
    ? ['zipCode', 'number', 'street', 'neighborhood', 'city', 'state']
    : estacioVisibleAddressFields(cepLookup)
  const showAddressField = (f: EstacioAddressField) => visibleAddressFields.includes(f)

  // Estado das etapas (stepper) — um bloco por seção, na ordem da tela:
  // 01 dados pessoais, 02 endereço (CEP + número), 03 ingresso + aceite.
  const dadosOk = candidateSchema.safeParse(candidateValues).success
  const enderecoOk = estacioAddressError(form) === null
  const ingressoOk =
    form.acceptTerms &&
    (form.codFormaIngresso !== CODIGO_VESTIBULAR_ENEM || form.graduationYear.length === 4)

  // Onde o formulário perde gente — rastreador compartilhado com a Cogna
  // (_shared/useCheckoutSteps.ts). Cada bloco emite `checkout_step_started` no
  // primeiro foco e `checkout_step_completed` na primeira vez que fica válido;
  // "parou no bloco X" = started sem completed. Existe para medir se o
  // abandono era mesmo o endereço (hipótese de out/2026, amostra de 25).
  const startStep = useCheckoutSteps(
    trackEvent,
    {
      flow: 'estacio',
      checkoutFlow: 'estacio_checkout',
      brand: offer.brand,
      modality: offer.modality,
      offerId: offer.offerId,
      courseName: offer.courseName,
    },
    [
      { n: 1, name: 'estudante', ok: dadosOk },
      { n: 2, name: 'endereco', ok: enderecoOk },
      { n: 3, name: 'ingresso', ok: ingressoOk },
    ],
  )

  /** Envio com candidato inválido: abre a seção 01 — o RHF foca o campo. */
  const onCandidateInvalid = () => {
    setExpanded((p) => ({ ...p, dados: true }))
    setError('Confira os dados do aluno destacados acima.')
  }

  const onCandidateValid = async (candidate: CandidateData) => {
    setError(null)

    if (!offer.offerId) {
      setError('Oferta inválida. Volte e selecione o curso novamente.')
      return
    }
    const addressError = estacioAddressError(form)
    if (addressError) {
      setError(addressError)
      setExpanded((p) => ({ ...p, endereco: true }))
      // Falta num campo escondido (ViaCEP ainda não respondeu, ou respondeu e
      // o candidato apagou): mostra os quatro em vez de deixar sem saída.
      setForceAddressReveal(true)
      return
    }
    if (form.codFormaIngresso === CODIGO_VESTIBULAR_ENEM && form.graduationYear.length !== 4) {
      setError('Informe o ano de conclusão do ensino médio.')
      setExpanded((p) => ({ ...p, ingresso: true }))
      return
    }
    if (!form.acceptTerms) {
      setError('É necessário aceitar os termos.')
      setExpanded((p) => ({ ...p, ingresso: true }))
      return
    }

    setSubmitting(true)
    candidateRef.current = candidate

    // Persiste o contato como lead (tabela Lead) sem bloquear a inscrição.
    void createLead({
      name: candidate.name,
      cpf: candidate.cpf,
      email: candidate.email.trim(),
      phone: candidate.phone,
      courseNames: offer.courseName ? [offer.courseName] : [],
      courseId: offer.offerId,
      courseName: offer.courseName,
      institutionName: offer.brand,
      modalidade: offer.modality,
      birthDate: candidate.birthDate || undefined,
      source: 'checkout-estacio',
      utm: readUtmifyParams() as unknown as Record<string, string | null>,
      // Endereço e forma de ingresso iam só pra Athena e não ficavam com a
      // gente; sem coluna própria, vão em extraData.
      extraData: {
        forma_ingresso: form.codFormaIngresso,
        ano_conclusao: form.graduationYear || undefined,
        endereco: {
          cep: form.zipCode.replace(/\D/g, '') || undefined,
          logradouro: form.street.trim() || undefined,
          numero: form.number.trim() || undefined,
          bairro: form.neighborhood.trim() || undefined,
          cidade: form.city.trim() || undefined,
          estado: form.state.trim().toUpperCase() || undefined,
          // Se o endereço veio do ViaCEP ou foi digitado (ViaCEP falhou) —
          // para medir quanto o caminho de falha acontece de verdade.
          origem: cepLookup?.ok && !forceAddressReveal ? 'viacep' : 'manual',
        },
        nivel: offer.academicLevel || undefined,
      },
    }).catch((leadError) => {
      console.error('Registro de lead falhou:', leadError)
      trackCheckoutError(trackEvent, 'estacio_lead_create', leadError, 'estacio_checkout')
    })

    // Funil unificado — etapa 2: identifica ANTES de enviar pra Estácio (se o
    // blur do CPF já não identificou).
    identify(candidate.cpf)

    // Funil unificado — etapa 3: ÚNICO disparo, no envio válido, igual à
    // Cogna. O resultado da Athena tem eventos próprios
    // (`estacio_enrollment_created`, `checkout_inscription_failed`).
    trackCheckoutSubmitted(trackEvent, {
      flow: 'estacio',
      checkoutFlow: 'estacio_checkout',
      brand: offer.brand,
      modality: offer.modality,
      offerId: offer.offerId,
      courseName: offer.courseName,
    })

    // Payload da inscrição montado AGORA (formulário em mãos), mas executado
    // só depois que a taxa for paga: o servidor guarda este payload na
    // Transaction (metadata.estacio) e cria a inscrição na confirmação do
    // pagamento. Ninguém é inscrito sem pagar, nem paga sem ser inscrito.
    const enrollment = buildAthenaEnrollment({
      offerId: offer.offerId,
      academicLevel: offer.academicLevel,
      candidate,
      address: form,
      ingresso: form,
    })

    // Interruptor geral (payments-disabled.ts): sem taxa, inscreve direto na
    // Athena — o trilho de antes da taxa (PR #108) — e vai para o sucesso sem
    // nenhuma tela de pagamento.
    if (PAYMENTS_DISABLED) {
      await enrollWithoutPayment(enrollment)
      return
    }

    setChargeContext({
      enrollment,
      offer: {
        offerId: offer.offerId,
        courseName: offer.courseName,
        brand: offer.brand,
        modality: offer.modality,
        city: offer.city,
        state: offer.state,
        academicLevel: offer.academicLevel,
        monthlyPrice: displayPrice > 0 ? displayPrice : undefined,
      },
    })
    setStage('payment')
    setSubmitting(false)

    trackEvent('estacio_taxa_payment_viewed', {
      offer_id: offer.offerId,
      course_name: offer.courseName,
      brand: offer.brand,
      amount_in_cents: taxaEmCentavos,
    })
  }

  const submitForm = handleCandidateSubmit(onCandidateValid, onCandidateInvalid)

  /** Inscrição direta na Athena, sem cobrança (pagamentos desligados). */
  const enrollWithoutPayment = async (enrollment: CreateEnrollmentInput) => {
    const candidate = candidateRef.current
    try {
      // `curso` na query só rotula o desfecho gravado no servidor; o body vai
      // inteiro para a Athena e não pode levar campo extra.
      const res = await fetch(
        `/api/athena-checkout?curso=${encodeURIComponent(offer.courseName ?? '')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrollment),
        },
      )
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const reason: string =
          data?.error || 'Não foi possível concluir sua inscrição nesta oferta.'
        trackEvent('checkout_inscription_failed', {
          flow: 'estacio',
          course_name: offer.courseName,
          offer_id: offer.offerId,
          brand: offer.brand,
          modality: offer.modality,
          error_message: reason,
          paid_before_enrollment: false,
        })
        reportInscriptionFailure({
          flow: 'estacio',
          cpf: candidate?.cpf ?? '',
          name: candidate?.name ?? '',
          email: candidate?.email.trim() ?? '',
          phone: candidate?.phone ?? '',
          courseName: offer.courseName,
          courseId: offer.offerId,
          brand: offer.brand,
          modalidade: offer.modality,
          city: offer.city,
          source: 'YDUQS',
          errorMessage: reason,
        })
        setError(reason)
        setSubmitting(false)
        return
      }

      const numeroInscricao: string | null =
        data?.numeroInscricao ||
        data?.providerResponse?.numeroInscricao ||
        data?.providerEnrollmentId ||
        null

      trackEvent('estacio_enrollment_created', {
        offer_id: offer.offerId,
        course_name: offer.courseName,
        numero_inscricao: numeroInscricao ?? undefined,
        payments_disabled: true,
      })
      void trackFbqDual(
        'Lead',
        {
          content_name: offer.courseName,
          content_ids: offer.offerId ? [String(offer.offerId)] : undefined,
          content_type: 'product',
          currency: 'BRL',
        },
        {
          email: candidate?.email.trim() || undefined,
          phone: candidate?.phone || undefined,
          externalId: candidate?.cpf || undefined,
          firstName: candidate?.name.split(/\s+/)[0] || undefined,
        },
        numeroInscricao ? `estacio_${numeroInscricao}` : undefined,
      )
      pushDataLayerEvent('generate_lead', {
        currency: 'BRL',
        ...(displayPrice > 0 ? { value: displayPrice } : {}),
      })

      // Sem paymentUrl/pixCode/taxa: a tela de sucesso não mostra pagamento.
      const params = new URLSearchParams()
      if (offer.courseName) params.set('course', offer.courseName)
      if (numeroInscricao) params.set('numeroInscricao', String(numeroInscricao))
      router.push(`/checkout/estacio/sucesso?${params.toString()}`)
    } catch (err) {
      trackCheckoutError(trackEvent, 'estacio_direct_enrollment', err, 'estacio_checkout')
      setError('Não conseguimos enviar sua inscrição agora. Tente de novo em instantes.')
      setSubmitting(false)
    }
  }

  /**
   * Taxa paga (PIX confirmado ou cartão aprovado). Daqui em diante quem manda
   * é o servidor: /api/athena-checkout/confirm valida o pagamento no Elysium,
   * cria a inscrição na Athena e, se a Estácio recusar, estorna a taxa. O
   * webhook do Elysium percorre o MESMO caminho de forma independente e
   * idempotente — fechar a aba agora não perde a inscrição.
   */
  const handlePaid = async (externalTransactionId: string) => {
    const candidate = candidateRef.current
    setConfirming(true)
    setConfirmError(null)

    const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const res = await fetch('/api/athena-checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalTransactionId }),
        })
        const data = await res.json().catch(() => null)

        // 202 = pagamento ainda não confirmado no Elysium (ou outra chamada
        // está processando esta transação agora). Não é erro: repete.
        if (res.status === 202) {
          await espera(2000)
          continue
        }

        if (res.ok && data?.status === 'ok') {
          const checkout = (data.checkout ?? {}) as {
            numeroInscricao?: string | null
            paymentUrl?: string | null
            pixCode?: string | null
            amount?: string | null
            dueDate?: string | null
            alreadyEnrolled?: boolean
          }

          trackEvent('estacio_enrollment_created', {
            offer_id: offer.offerId,
            course_name: offer.courseName,
            numero_inscricao: checkout.numeroInscricao ?? undefined,
            already_enrolled: !!checkout.alreadyEnrolled,
          })

          // Meta Pixel + Conversions API - Lead (inscrição Estácio; o curso é
          // pago na instituição). event_id pela inscrição, para dedup.
          void trackFbqDual(
            'Lead',
            {
              content_name: offer.courseName,
              content_ids: offer.offerId ? [String(offer.offerId)] : undefined,
              content_type: 'product',
              currency: 'BRL',
            },
            {
              email: candidate?.email.trim() || undefined,
              phone: candidate?.phone || undefined,
              externalId: candidate?.cpf || undefined,
              firstName: candidate?.name.split(/\s+/)[0] || undefined,
            },
            checkout.numeroInscricao ? `estacio_${checkout.numeroInscricao}` : undefined,
          )

          // GA4 (dataLayer/GTM) - generate_lead, paridade com o Lead do Meta.
          pushDataLayerEvent('generate_lead', {
            currency: 'BRL',
            ...(displayPrice > 0 ? { value: displayPrice } : {}),
          })

          const params = new URLSearchParams()
          if (offer.courseName) params.set('course', offer.courseName)
          if (checkout.numeroInscricao) params.set('numeroInscricao', String(checkout.numeroInscricao))
          if (checkout.paymentUrl) params.set('paymentUrl', String(checkout.paymentUrl))
          if (checkout.pixCode) params.set('pixCode', String(checkout.pixCode))
          if (checkout.amount) params.set('amount', String(checkout.amount))
          if (checkout.dueDate) params.set('dueDate', String(checkout.dueDate))
          // Taxa da plataforma já paga — a tela de sucesso mostra as duas
          // cobranças separadas (a nossa, paga; a da Estácio, a pagar).
          params.set('taxa', String(taxaEmCentavos))

          // Meta — Purchase TAMBÉM pelo navegador.
          //
          // O servidor já dispara este evento (confirm-estacio.ts). Ele sozinho
          // bastaria se o pixel aceitasse CAPI — mas o pixel que as campanhas
          // usam pertence a uma conta pessoal, e CAPI só funciona em pixel de
          // business. Sem este disparo, a compra do Estácio simplesmente não
          // chega lá.
          //
          // Dispara AQUI, não na tela de sucesso: este ponto é o único que sabe
          // as duas coisas ao mesmo tempo — que o pagamento confirmou e que a
          // Estácio ACEITOU a inscrição. Na tela de sucesso não daria para
          // distinguir de uma recusa já estornada, e contaríamos venda que não
          // existiu.
          //
          // `event_id` = externalTransactionId, IDÊNTICO ao do servidor. Nos
          // pixels que recebem os dois lados a Meta dedupa e conta uma vez; nos
          // que só recebem navegador, este é o único que chega. Mudar este id
          // sem mudar o de confirm-estacio.ts faz a mesma compra contar duas
          // vezes e a campanha otimizar por receita inflada.
          void trackFbqDual(
            'Purchase',
            {
              currency: 'BRL',
              // A TAXA cobrada por nós, não a mensalidade do curso.
              value: taxaEmCentavos / 100,
              content_name: offer.courseName,
              content_type: 'product',
              content_ids: offer.offerId ? [String(offer.offerId)] : undefined,
            },
            {
              email: candidate?.email.trim() || undefined,
              phone: candidate?.phone || undefined,
              externalId: candidate?.cpf || undefined,
            },
            externalTransactionId,
          )

          // NÃO navega ainda. A taxa está paga e a inscrição, criada — mas o
          // candidato só vê a tela de sucesso DEPOIS de passar pelo
          // pagamento da matrícula na Estácio, que é o próximo passo aqui
          // mesmo (stage 'institution'). Ver o comentário na declaração de
          // `stage`. Diferente da Cogna, já temos tudo (paymentUrl/pixCode)
          // nesta mesma resposta — sem lookup assíncrono.
          setInstitutionPayment({
            successUrl: `/checkout/estacio/sucesso?${params.toString()}`,
            paymentUrl: checkout.paymentUrl ?? null,
            pixCode: checkout.pixCode ?? null,
            amount: checkout.amount ?? null,
            dueDate: checkout.dueDate ?? null,
          })
          setStage('institution')
          return
        }

        if (res.status === 422) {
          const reason: string =
            data?.reason || 'Não foi possível concluir sua inscrição nesta oferta.'
          const estorno = data?.refunded
            ? ' A taxa da plataforma foi estornada — o valor volta pelo mesmo meio de pagamento.'
            : ' Nosso time já foi avisado e vai devolver a taxa da plataforma.'

          trackEvent('checkout_inscription_failed', {
            flow: 'estacio',
            course_name: offer.courseName,
            offer_id: offer.offerId,
            brand: offer.brand,
            modality: offer.modality,
            error_message: reason,
            refunded: !!data?.refunded,
            paid_before_enrollment: true,
          })
          reportInscriptionFailure({
            flow: 'estacio',
            cpf: candidate?.cpf ?? '',
            name: candidate?.name ?? '',
            email: candidate?.email.trim() ?? '',
            phone: candidate?.phone ?? '',
            courseName: offer.courseName,
            courseId: offer.offerId,
            brand: offer.brand,
            modalidade: offer.modality,
            city: offer.city,
            source: 'YDUQS',
            errorMessage: reason,
          })

          setConfirmError(`${reason}${estorno}`)
          setConfirming(false)
          return
        }

        await espera(2000)
      } catch (err) {
        trackCheckoutError(trackEvent, 'estacio_confirm_enrollment', err, 'estacio_checkout')
        await espera(2000)
      }
    }

    setConfirmError(
      'Seu pagamento foi registrado, mas não conseguimos confirmar a inscrição agora. Não pague de novo — fale com a gente pelo WhatsApp que resolvemos (inscrição ou devolução da taxa).',
    )
    setConfirming(false)
  }

  const steps = [
    { n: '01', label: 'Estudante', done: dadosOk, active: stage === 'form' && !dadosOk },
    { n: '02', label: 'Endereço', done: enderecoOk, active: stage === 'form' && dadosOk && !enderecoOk },
    {
      n: '03',
      label: 'Ingresso',
      done: ingressoOk || stage === 'payment',
      active: stage === 'form' && dadosOk && enderecoOk && !ingressoOk,
    },
    ...(PAYMENTS_DISABLED
      ? []
      : [{ n: '04', label: 'Pagamento', done: false, active: stage === 'payment' || stage === 'institution' }]),
  ]

  const taxaFormatada = (taxaEmCentavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

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
            Inscrição · {offer.brand}
          </span>
          <h1 className="font-display text-3xl md:text-[40px] font-semibold text-ink-900 leading-[1.1]">
            Garanta sua bolsa{' '}
            <span className="italic text-ink-700">em poucos passos.</span>
          </h1>
          <p className="text-ink-500 text-[14px] md:text-[15px] mt-3 leading-relaxed max-w-2xl">
            {PAYMENTS_DISABLED ? (
              <>
                Complete seus dados pra gente enviar sua inscrição. A matrícula e as
                mensalidades do curso são tratadas diretamente com a instituição.
              </>
            ) : (
              <>
                Complete seus dados e pague a taxa da plataforma ({taxaFormatada}) pra
                gente enviar sua inscrição. A matrícula e as mensalidades do curso continuam sendo
                pagas diretamente à instituição.
              </>
            )}
          </p>

          {/* Stepper editorial */}
          <ol
            className="mt-8 flex items-center gap-3 md:gap-4 text-[11px] md:text-[12px]"
            aria-label="Etapas do checkout"
          >
            {steps.map((step, idx, arr) => {
              const visible = step.active || step.done
              return (
                <li key={step.n} className="flex items-center gap-3 md:gap-4">
                  <div className={`flex items-center gap-2.5 ${visible ? 'text-ink-900' : 'text-ink-300'}`}>
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
                      className={`h-px w-8 md:w-12 transition-colors ${step.done ? 'bg-ink-900' : 'bg-hairline'}`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-7 bg-white border border-hairline rounded-2xl overflow-hidden shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)]">
            {stage === 'payment' && chargeContext ? (
              <div className="p-6 md:p-7">
                {!confirming && (
                  <button
                    type="button"
                    onClick={() => {
                      setStage('form')
                      setConfirmError(null)
                    }}
                    className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors mb-5"
                  >
                    <ArrowLeft size={12} />
                    Editar meus dados
                  </button>
                )}

                <h2 className="font-display text-2xl text-ink-900 leading-tight">
                  Taxa da plataforma
                </h2>
                <p className="mt-2 mb-5 text-[13px] leading-relaxed text-ink-500">
                  São {taxaFormatada}, cobrados por nós, para enviar sua inscrição à {offer.brand}.
                  Essa taxa <span className="text-ink-900">não é a matrícula do curso</span>: a
                  cobrança da instituição (matrícula e mensalidades) é separada e aparece na próxima
                  tela, logo depois da inscrição confirmada.
                </p>

                <EstacioPayment
                  amountInCents={taxaEmCentavos}
                  customer={{
                    name: candidateRef.current?.name ?? '',
                    cpf: candidateRef.current?.cpf ?? '',
                    email: candidateRef.current?.email.trim() ?? '',
                    phone: candidateRef.current?.phone ?? '',
                    postalCode: form.zipCode,
                    addressNumber: form.number.trim(),
                  }}
                  context={chargeContext}
                  onPaid={handlePaid}
                  externalError={confirmError}
                  confirming={confirming}
                />
              </div>
            ) : stage === 'institution' && institutionPayment ? (
              <div className="p-6 md:p-7 space-y-5">
                <div className="flex items-center gap-2 text-sm text-bolsa-secondary">
                  <CheckCircle2 size={16} />
                  <span>Taxa da plataforma paga — falta a matrícula na Estácio.</span>
                </div>

                {institutionPayment.pixCode ? (
                  <div className="rounded-lg border border-hairline p-4">
                    <h3 className="font-medium text-ink-900 mb-1 text-center">
                      Pague a matrícula da Estácio com PIX
                    </h3>
                    <p className="text-xs text-center text-ink-500 mb-4">
                      Cobrança da instituição — não é a taxa da plataforma, que já está paga.
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white border border-hairline rounded-xl shadow-sm inline-block">
                        <QRCode
                          value={institutionPayment.pixCode}
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center text-ink-500 mb-3">
                      Escaneie o QR code com o app do seu banco
                    </p>
                    <div className="border-t border-hairline pt-3 mt-3">
                      <p className="text-xs text-ink-500 mb-1 font-medium">Ou copie o código PIX:</p>
                      <p className="text-xs text-ink-400 mb-2 break-all bg-paper-warm rounded p-2 font-mono leading-relaxed">
                        {institutionPayment.pixCode}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(institutionPayment.pixCode || '').then(() => {
                            setInstitutionPixCopied(true)
                            setTimeout(() => setInstitutionPixCopied(false), 2000)
                          })
                        }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-bolsa-secondary hover:brightness-90"
                      >
                        <Copy className="w-4 h-4" />
                        {institutionPixCopied ? 'Copiado!' : 'Copiar código PIX'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      Estamos preparando seu pagamento
                    </p>
                    <p className="text-sm text-amber-800 mt-1">
                      Assim que ficar pronto enviamos por e-mail. Sua inscrição já está
                      registrada — nada se perde.
                    </p>
                  </div>
                )}

                {institutionPayment.paymentUrl && (
                  <a
                    href={institutionPayment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-hairline py-3 px-6 text-[14px] font-medium text-ink-900 hover:bg-paper-warm transition-colors"
                  >
                    Pagar a matrícula na Estácio
                    <ExternalLink size={14} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => router.push(institutionPayment.successUrl)}
                  className="checkout-step-cta group w-full inline-flex items-center justify-center gap-3 bg-bolsa-secondary text-white py-4 px-6 rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 transition-all duration-300"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
                <p className="text-xs text-ink-500 text-center">
                  Você não precisa terminar o pagamento agora para continuar — sua inscrição já
                  está garantida e o link de pagamento também chega por e-mail.
                </p>
              </div>
            ) : (
            <form onSubmit={submitForm} noValidate>
              {/* 01 · Dados do aluno — os 5 campos do formulário único */}
              <div onFocusCapture={() => startStep(1)}>
              <Section
                icon={<User size={15} />}
                step="01 · Estudante"
                title="Dados do aluno"
                open={expanded.dados}
                onToggle={() => toggleSection('dados')}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <EmailField
                      register={register}
                      errors={errors}
                      value={candidateValues.email}
                      onSuggestionAccept={(email) => setValue('email', email, { shouldValidate: true })}
                    />
                    <NameField register={register} errors={errors} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CpfField control={control} errors={errors} validation={cpfCheck} />
                    <BirthDateField control={control} errors={errors} />
                  </div>
                  <PhoneField control={control} errors={errors} label="Celular" />
                </div>
              </Section>
              </div>

              {/* 02 · Endereço — só CEP + número; o ViaCEP completa o resto */}
              <div onFocusCapture={() => startStep(2)}>
              <Section
                icon={<MapPin size={15} />}
                step="02 · Endereço"
                title="Onde você mora"
                open={expanded.endereco}
                onToggle={() => toggleSection('endereco')}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>CEP</label>
                    <div className="relative">
                      <input inputMode="numeric" autoComplete="postal-code" className={inputClass}
                        value={form.zipCode}
                        onChange={(e) => void handleCepChange(e.target.value)}
                        placeholder="00000-000" />
                      {cepLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-ink-300" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input className={inputClass} value={form.number} autoComplete="address-line2"
                      onChange={(e) => set('number', e.target.value)} />
                  </div>

                  {cepLookup?.ok && !forceAddressReveal && (
                    <p className="md:col-span-3 text-[13px] text-ink-500">
                      {[form.street, form.neighborhood].filter(Boolean).join(', ')}
                      {form.street || form.neighborhood ? ' — ' : ''}
                      {form.city}/{form.state}{' '}
                      <button
                        type="button"
                        className="underline text-ink-700 hover:text-ink-900"
                        onClick={() => setForceAddressReveal(true)}
                      >
                        Corrigir
                      </button>
                    </p>
                  )}
                  {cepLookup && !cepLookup.ok && cepLookup.reason !== 'invalid' && (
                    <p className="md:col-span-3 text-[12px] text-amber-700">
                      {cepLookup.reason === 'not_found'
                        ? 'Não encontramos esse CEP. Confira o número ou preencha o endereço abaixo.'
                        : 'Não conseguimos completar o endereço pelo CEP agora. Preencha os campos abaixo.'}
                    </p>
                  )}

                  {showAddressField('street') && (
                    <div className="md:col-span-2">
                      <label className={labelClass}>Logradouro</label>
                      <input className={inputClass} value={form.street}
                        onChange={(e) => set('street', e.target.value)} />
                    </div>
                  )}
                  {showAddressField('neighborhood') && (
                    <div>
                      <label className={labelClass}>Bairro</label>
                      <input className={inputClass} value={form.neighborhood}
                        onChange={(e) => set('neighborhood', e.target.value)} />
                    </div>
                  )}
                  {showAddressField('city') && (
                    <div>
                      <label className={labelClass}>Cidade</label>
                      <input className={inputClass} value={form.city}
                        onChange={(e) => set('city', e.target.value)} />
                    </div>
                  )}
                  {showAddressField('state') && (
                    <div>
                      <label className={labelClass}>UF</label>
                      <input maxLength={2} className={inputClass} value={form.state}
                        onChange={(e) => set('state', e.target.value.toUpperCase())} placeholder="SP" />
                    </div>
                  )}
                </div>
              </Section>
              </div>

              {/* 03 · Ingresso */}
              <div onFocusCapture={() => startStep(3)}>
              <Section
                icon={<GraduationCap size={15} />}
                step="03 · Ingresso"
                title="Forma de ingresso"
                open={expanded.ingresso}
                onToggle={() => toggleSection('ingresso')}
                last
              >
                {offer.academicLevel === 'POS_GRADUACAO' ? (
                  <p className="text-[14px] text-ink-500">
                    Forma de ingresso: inscrição de pós-graduação — não precisa escolher, já está definida pra esse curso.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className={labelClass}>Como você vai ingressar?</label>
                      <Listbox
                        value={form.codFormaIngresso}
                        onChange={(value) => set('codFormaIngresso', value)}
                      >
                        <div className="relative">
                          <ListboxButton
                            className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                          >
                            <span className="truncate">
                              {visibleFormaIngressoOptions.find((o) => o.value === form.codFormaIngresso)?.label}
                            </span>
                            <ChevronDown size={14} className="text-ink-400 flex-shrink-0" />
                          </ListboxButton>
                          {/* z-[1300] não é número mágico: o CTA do passo usa
                              .checkout-step-cta (z-index 1200, para vencer o banner
                              de cookies em 1100). Abaixo disso, o botão cobre as
                              opções abertas — era o que acontecia com z-20. */}
                          <ListboxOptions
                            anchor="bottom start"
                            transition
                            className="w-[var(--button-width)] z-[1300] mt-1 rounded-xl border border-hairline bg-white py-1 shadow-lg focus:outline-none transition duration-100 ease-in data-[closed]:opacity-0"
                          >
                            {visibleFormaIngressoOptions.map((option) => (
                              <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 data-[focus]:bg-paper-warm"
                              >
                                <span>
                                  <span className="block text-[14px] text-ink-900">{option.label}</span>
                                  {option.hint && (
                                    <span className="block text-[12px] text-ink-400">{option.hint}</span>
                                  )}
                                </span>
                                <Check
                                  size={14}
                                  className="invisible flex-shrink-0 text-bolsa-secondary group-data-[selected]:visible"
                                />
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </div>
                      </Listbox>
                    </div>

                    {form.codFormaIngresso === CODIGO_VESTIBULAR_ENEM && (
                      <div className="mt-3 max-w-xs">
                        <label className={labelClass}>Ano de conclusão do ensino médio</label>
                        <input inputMode="numeric" className={inputClass} value={form.graduationYear}
                          onChange={(e) => set('graduationYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="2018" />
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-start gap-2.5 text-[13px] text-ink-700 mt-4">
                  <input type="checkbox" className="mt-1 accent-bolsa-secondary" checked={form.acceptTerms}
                    onChange={(e) => set('acceptTerms', e.target.checked)} />
                  Li e aceito os termos e autorizo a realização da inscrição.
                </label>

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="checkout-step-cta group mt-5 w-full inline-flex items-center justify-center gap-3 bg-bolsa-secondary text-white py-4 px-6 rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 disabled:bg-ink-300 disabled:cursor-not-allowed shadow-lg shadow-bolsa-secondary/25 hover:shadow-bolsa-secondary/40 transition-all duration-300"
                >
                  {submitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando…
                    </span>
                  ) : (
                    <>
                      {PAYMENTS_DISABLED ? 'Enviar inscrição' : 'Ir para o pagamento da taxa'}
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                {!PAYMENTS_DISABLED && (
                  <p className="text-center text-[11px] text-ink-400 mt-3">
                    Próximo passo: pagar a taxa da plataforma ({taxaFormatada}). A
                    inscrição é enviada à instituição assim que o pagamento confirmar.
                  </p>
                )}
              </Section>
              </div>
            </form>
            )}
          </div>

          {/* Coluna Direita - Resumo da oferta */}
          <aside className="lg:col-span-5 bg-white border border-hairline rounded-2xl p-6 md:p-7 h-fit shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)] lg:sticky lg:top-24">
            <div className="hairline-b pb-5 mb-5">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-2">
                <BookOpen size={11} />
                Detalhes do curso
              </span>
              <h2 className="font-display text-2xl text-ink-900 leading-tight">
                {offer.courseName || 'Inscrição'}
              </h2>
            </div>

            {displayPrice > 0 && (
              <div className="bg-paper-warm border border-hairline rounded-2xl p-5 mb-5">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2 block">
                  Mensalidade com bolsa
                </span>
                {priceAnchor && (
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[12px] text-ink-300 line-through num-tabular">
                      De {formatCurrency(offer.maxPrice!)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bolsa-secondary text-white text-[10px] font-bold tracking-wide">
                      −{priceAnchor.discountPct}%
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700 font-medium">R$</span>
                  <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                    {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[12px] text-ink-500">/mês</span>
                </div>
                {priceAnchor?.totalSavings !== null && priceAnchor?.totalSavings !== undefined && (
                  <p className="text-[11px] text-emerald-600 mt-1.5">
                    Economize {formatCurrency(priceAnchor.totalSavings)} até o fim do curso
                  </p>
                )}
                {(form.codFormaIngresso === 2 || form.codFormaIngresso === 3) &&
                  displayPrice !== offer.price &&
                  offer.price > 0 && (
                    <p className="text-[11px] text-ink-400 mt-2 italic">
                      Valor específico pra forma de ingresso escolhida
                    </p>
                  )}
                <p className="text-[11px] text-ink-500 mt-3 italic">
                  Pago diretamente à instituição de ensino
                </p>
              </div>
            )}

            {!PAYMENTS_DISABLED && (
            <div className="bg-bolsa-primary/5 border border-bolsa-primary/15 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-bolsa-primary text-white flex items-center justify-center font-bold text-[11px]">
                  i
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-ink-900 mb-1">
                    São duas cobranças diferentes
                  </p>
                  <p className="text-[12px] text-ink-500 leading-relaxed">
                    <span className="font-semibold text-ink-900">{taxaFormatada}</span> é a taxa da
                    plataforma, paga aqui, uma única vez, para enviarmos sua
                    inscrição. A matrícula e as mensalidades do curso são cobradas à parte, pela
                    própria instituição — o boleto/PIX dela chega logo depois da inscrição.
                  </p>
                </div>
              </div>
            </div>
            )}

            <ul className="space-y-2.5">
              <li className="flex items-center gap-3 text-[13px] text-ink-700">
                <Building2 size={14} className="text-ink-300 flex-shrink-0" />
                <span className="font-medium text-ink-900">{offer.brand}</span>
              </li>
              {offer.modality && (
                <li className="flex items-center gap-3 text-[13px] text-ink-700">
                  <BookOpen size={14} className="text-ink-300 flex-shrink-0" />
                  {offer.modality}
                </li>
              )}
              {offer.unitAddress ? (
                <li className="flex items-start gap-3 text-[13px] text-ink-700">
                  <MapPin size={14} className="mt-0.5 text-ink-300 flex-shrink-0" />
                  <span>
                    <span className="block font-medium text-ink-900">
                      {titleCasePtBr(offer.unitAddress)}
                    </span>
                    <span className="block text-[12px] text-ink-500 mt-0.5">
                      {[
                        offer.unitDistrict && titleCasePtBr(offer.unitDistrict),
                        offer.city && titleCasePtBr(offer.city),
                        offer.state,
                      ]
                        .filter(Boolean)
                        .join(' — ')}
                      {offer.unitPostalCode && ` · CEP ${offer.unitPostalCode}`}
                    </span>
                  </span>
                </li>
              ) : (
                (offer.city || offer.state) && (
                  <li className="flex items-center gap-3 text-[13px] text-ink-700">
                    <MapPin size={14} className="text-ink-300 flex-shrink-0" />
                    {offer.city}
                    {offer.city && offer.state ? ' — ' : ''}
                    {offer.state}
                  </li>
                )
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}

/** Seção expansível no estilo do checkout Anhanguera. */
function Section({
  icon,
  step,
  title,
  open,
  onToggle,
  last,
  children,
}: {
  icon: React.ReactNode
  step: string
  title: string
  open: boolean
  onToggle: () => void
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? '' : 'border-b border-hairline'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-paper-warm/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-ink-900 flex-shrink-0">
            {icon}
          </span>
          <div className="min-w-0">
            <span className="font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5 block">
              {step}
            </span>
            <h2 className="font-display text-[18px] text-ink-900 leading-tight">{title}</h2>
          </div>
        </div>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all ${
            open ? 'rotate-180 border-ink-900 text-ink-900' : ''
          }`}
        >
          <ChevronDown size={14} />
        </span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}
