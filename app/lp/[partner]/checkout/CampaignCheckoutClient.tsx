'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, ArrowLeft, GraduationCap, MapPin, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getOfferDetails, type OfferDetails } from '@/app/lib/api/get-offer-details'
import { formatCurrency } from '@/utils/fomartCurrency'
import { formatPhone } from '@/utils/formatters'
import { validarCPF } from '@/utils/cpf-validate'
import { getVisitorId } from '../../_shared/visitor-id'
import CampaignPayment from './CampaignPayment'

const formSchema = z.object({
  name: z.string().min(3, 'Informe o nome completo').transform((v) => v.trim()),
  email: z.string().email('E-mail inválido'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 11, 'CPF inválido')
    .refine((v) => validarCPF(v), { message: 'CPF inválido' }),
  birthDate: z
    .string()
    .refine((v) => {
      const regex = /^\d{2}-\d{2}-\d{4}$/
      if (!regex.test(v)) return false
      const [day, month, year] = v.split('-').map(Number)
      const birth = new Date(year, month - 1, day)
      if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return false
      const today = new Date()
      if (year < 1930 || year > today.getFullYear()) return false
      let age = today.getFullYear() - year
      const hadBirthday = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
      if (!hadBirthday) age--
      return age >= 15
    }, { message: 'Data de nascimento inválida (o candidato deve ter mais de 15 anos)' }),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 11 && v[2] === '9', 'Informe um celular válido no formato (99) 99999-9999'),
})

type FormValues = z.infer<typeof formSchema>

const MODALITY_LABEL: Record<string, string> = { EAD: 'EaD', VIRTUAL: 'EaD', PRESENCIAL: 'Presencial', SEMIPRESENCIAL: 'Semipresencial' }
const SHIFT_LABEL: Record<string, string> = { VIRTUAL: 'Virtual', NOTURNO: 'Noturno', MATUTINO: 'Matutino', VESPERTINO: 'Vespertino', INTEGRAL: 'Integral' }


const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']

function formatBirthDateInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`
}

function formatCpfInput(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

interface Props {
  partner: string
  partnerName: string
  brandColor: string
  /** Valor cobrado em centavos, vindo do server (campaign-charge.ts). */
  amountInCents: number
}

type ConfirmState =
  | { kind: 'idle' }
  | { kind: 'confirming' }
  | { kind: 'refused'; reason: string }
  | { kind: 'error'; message: string }

export default function CampaignCheckoutClient({ partner, partnerName, brandColor, amountInCents }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const groupId = searchParams.get('groupId') || ''
  const unitId = searchParams.get('unitId') || ''
  const modality = searchParams.get('modality') || ''
  const shift = searchParams.get('shift') || (modality.toUpperCase() === 'EAD' ? 'VIRTUAL' : '')
  const courseNameParam = searchParams.get('courseName') || ''
  const cityParam = searchParams.get('city') || ''

  const [ingressType, setIngressType] = useState<'ENEM' | 'VESTIBULAR'>('VESTIBULAR')
  const [confirmState, setConfirmState] = useState<ConfirmState>({ kind: 'idle' })
  const [showValidation, setShowValidation] = useState(false)
  const [utm, setUtm] = useState<Record<string, string>>({})

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const k of UTM_KEYS) {
      const v = sp.get(k)
      if (v) found[k] = v
    }
    setUtm(found)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', cpf: '', birthDate: '', phone: '' },
  })
  const values = watch()

  const setFormatted = (field: 'cpf' | 'birthDate' | 'phone', formatter: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(field, formatter(e.target.value), { shouldValidate: showValidation })
  }

  // Gate real de "pode pagar": valida contra o schema inteiro, não só o
  // estado de erro do react-hook-form (que só populava depois do 1º
  // shouldValidate — deixava passar CPF/telefone incompletos digitados antes
  // da 1ª tentativa de pagamento).
  const formReady = useMemo(() => formSchema.safeParse(values).success, [values])

  const { data: offerDetails, isLoading, error: offerError } = useQuery<OfferDetails>({
    queryKey: ['campaign-offer-details', groupId, shift, modality, unitId],
    queryFn: () => getOfferDetails(groupId, shift, modality, unitId),
    enabled: !!groupId && !!modality && !!unitId,
    retry: 1,
  })

  const missingParams = !groupId || !unitId || !modality

  const priceLabel = useMemo(() => {
    if (offerDetails?.montlyFeeTo) return offerDetails.montlyFeeTo
    const p = Number(searchParams.get('price') || 0)
    return p > 0 ? p : undefined
  }, [offerDetails, searchParams])

  const handleRequireData = () => {
    setShowValidation(true)
    void trigger()
  }

  const handlePaid = async (externalTransactionId: string) => {
    setConfirmState({ kind: 'confirming' })

    // Confirmação idempotente: tenta algumas vezes se vier "pending" (raro,
    // corrida entre o Elysium marcar PAID e o webhook/claim interno).
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const res = await fetch('/api/ingressa/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalTransactionId }),
        })
        const data = await res.json().catch(() => null)

        if (res.status === 202) {
          await new Promise((r) => setTimeout(r, 2000))
          continue
        }
        if (res.ok && data?.status === 'ok') {
          const params = new URLSearchParams()
          if (data.inscriptionId) params.set('inscriptionId', String(data.inscriptionId))
          if (offerDetails?.course) params.set('course', offerDetails.course)
          router.push(`/lp/${partner}/checkout/sucesso?${params.toString()}`)
          return
        }
        if (res.status === 422) {
          setConfirmState({ kind: 'refused', reason: data?.reason || 'Não foi possível concluir sua inscrição.' })
          return
        }
        setConfirmState({ kind: 'error', message: 'Não conseguimos confirmar sua inscrição agora. Fale com a gente pelo WhatsApp — seu pagamento está registrado.' })
        return
      } catch {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    setConfirmState({ kind: 'error', message: 'Não conseguimos confirmar sua inscrição agora. Fale com a gente pelo WhatsApp — seu pagamento está registrado.' })
  }

  if (missingParams) {
    return (
      <ErrorScreen
        partner={partner}
        title="Oferta não encontrada"
        message="Faltam informações para carregar essa oferta. Volte e escolha o curso novamente."
      />
    )
  }

  if (offerError) {
    return (
      <ErrorScreen
        partner={partner}
        title="Não foi possível carregar essa oferta"
        message="Ela pode ter saído do ar. Volte e escolha outra opção de curso ou unidade."
      />
    )
  }

  if (confirmState.kind === 'refused') {
    return (
      <ErrorScreen
        partner={partner}
        title="Inscrição não confirmada"
        message={confirmState.reason}
        // Sem promessa de estorno: a campanha não estorna (ver
        // confirm-campaign.ts). O pagamento está registrado e a pendência já
        // foi pro CRM — prometer devolução aqui criaria uma expectativa que o
        // time não vai cumprir, e é isso que vira reclamação.
        footnote={"Seu pagamento está registrado e nosso time já foi avisado — entramos em contato pra concluir sua inscrição."}
      />
    )
  }

  if (confirmState.kind === 'error') {
    return <ErrorScreen partner={partner} title="Algo deu errado" message={confirmState.message} />
  }

  const modalityLabel = offerDetails?.modality ? MODALITY_LABEL[offerDetails.modality.toUpperCase()] || offerDetails.modality : undefined
  const shiftLabel = offerDetails?.shift ? SHIFT_LABEL[offerDetails.shift.toUpperCase()] || offerDetails.shift : undefined

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <Link href={`/lp/${partner}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Voltar
      </Link>

      {/* Resumo da oferta */}
      <div className="mb-6 rounded-2xl border border-hairline bg-white p-5">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-5 w-2/3 rounded bg-paper-warm" />
            <div className="h-4 w-1/3 rounded bg-paper-warm" />
          </div>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">{partnerName}</p>
            <h1 className="font-display text-xl font-semibold text-ink-900">{offerDetails?.course || courseNameParam}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-500">
              {(modalityLabel || shiftLabel) && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap size={13} /> {[modalityLabel, shiftLabel].filter(Boolean).join(' • ')}
                </span>
              )}
              {(offerDetails?.unitCity || cityParam) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} /> {offerDetails?.unitCity || cityParam}
                </span>
              )}
            </div>
            {priceLabel != null && (
              <p className="mt-2 text-[13px] text-ink-700">
                Mensalidade com bolsa: <strong className="num-tabular">{formatCurrency(priceLabel)}</strong>/mês
              </p>
            )}
          </>
        )}
      </div>

      {/* Dados pessoais */}
      <form className="mb-6 space-y-3 rounded-2xl border border-hairline bg-white p-5" onSubmit={handleSubmit(() => {})}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">Seus dados</p>

        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">Nome completo</label>
          <input
            {...register('name')}
            className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-bolsa-primary"
          />
          {showValidation && errors.name && <p className="mt-1 text-[12px] text-bolsa-secondary">{errors.name.message}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">CPF</label>
            <input
              value={values.cpf || ''}
              onChange={setFormatted('cpf', formatCpfInput)}
              inputMode="numeric"
              placeholder="000.000.000-00"
              className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-bolsa-primary"
            />
            {showValidation && errors.cpf && <p className="mt-1 text-[12px] text-bolsa-secondary">{errors.cpf.message}</p>}
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">Data de nascimento</label>
            <input
              value={values.birthDate || ''}
              onChange={setFormatted('birthDate', formatBirthDateInput)}
              inputMode="numeric"
              placeholder="DD-MM-AAAA"
              className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-bolsa-primary"
            />
            {showValidation && errors.birthDate && <p className="mt-1 text-[12px] text-bolsa-secondary">{errors.birthDate.message}</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">WhatsApp</label>
            <input
              value={values.phone || ''}
              onChange={setFormatted('phone', formatPhone)}
              inputMode="tel"
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-bolsa-primary"
            />
            {showValidation && errors.phone && <p className="mt-1 text-[12px] text-bolsa-secondary">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">E-mail</label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-bolsa-primary"
            />
            {showValidation && errors.email && <p className="mt-1 text-[12px] text-bolsa-secondary">{errors.email.message}</p>}
          </div>
        </div>

        {offerDetails?.academicLevel === 'GRADUACAO' && (
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">Forma de ingresso</p>
            <div className="flex gap-2">
              {(['VESTIBULAR', 'ENEM'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIngressType(opt)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    ingressType === opt ? 'border-transparent text-white' : 'border-hairline bg-white text-ink-700'
                  }`}
                  style={ingressType === opt ? { backgroundColor: brandColor } : undefined}
                >
                  {opt === 'VESTIBULAR' ? 'Vestibular' : 'ENEM'}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Pagamento */}
      {confirmState.kind === 'confirming' ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-paper py-10 text-center">
          <ShieldCheck className="h-8 w-8 animate-pulse text-bolsa-primary" />
          <p className="font-display text-lg text-ink-900">Confirmando sua inscrição…</p>
          <p className="text-sm text-ink-500">Isso leva só alguns segundos.</p>
        </div>
      ) : offerDetails ? (
        <CampaignPayment
          amountInCents={amountInCents}
          customer={{ name: values.name || '', cpf: values.cpf || '', email: values.email || '', phone: values.phone || '' }}
          context={{
            offerDetails,
            ingressType,
            birthDate: values.birthDate || '',
            partner,
            partnerName,
            visitorId: getVisitorId(),
            utm,
          }}
          formReady={formReady}
          onRequireData={handleRequireData}
          onPaid={handlePaid}
        />
      ) : null}
    </div>
  )
}

function ErrorScreen({ partner, title, message, footnote }: { partner: string; title: string; message: string; footnote?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-bolsa-secondary" />
      <h1 className="font-display text-xl font-semibold text-ink-900">{title}</h1>
      <p className="text-sm text-ink-700">{message}</p>
      {footnote && <p className="text-[12px] text-ink-500">{footnote}</p>}
      <Link
        href={`/lp/${partner}`}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-bolsa-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-bolsa-primary/90"
      >
        Voltar às ofertas
      </Link>
    </div>
  )
}
