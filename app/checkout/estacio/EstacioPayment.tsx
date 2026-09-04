'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, CreditCard, Loader2, Lock, QrCode, ShieldCheck, X } from 'lucide-react'
import QRCode from 'react-qr-code'
import type { CreateEnrollmentInput } from '@/app/lib/api/athena-offers'

/**
 * Pagamento da taxa de matrícula do Bolsa Click no checkout Estácio.
 *
 * Fork enxuto de `app/checkout/matricula/MatriculaPayment.tsx` (PIX + cartão,
 * sem boleto — R$ 19,90 que levam 3 dias para compensar atrasariam a inscrição
 * na mesma medida). Não reaproveita o componente original porque ele cria a
 * cobrança em /api/checkout com o valor vindo do cliente e confirma pelo fluxo
 * Cogna; aqui o valor é fixo no servidor e o pai decide o que fazer com o
 * pagamento, via `onPaid`.
 *
 * O polling NÃO usa /api/checkout/status/[id] de propósito: aquela rota
 * sincroniza o status local para PAID e roubaria o claim atômico da
 * confirmação (ver confirm-estacio.ts). Quem diz se pagou aqui é a própria
 * rota de confirmação, que já valida no Elysium.
 */

type Method = 'pix' | 'card'

/** Campos do cartão coletados no form (nomes alinhados ao contrato Asaas). */
interface CardFields {
  holderName: string
  number: string
  expiryMonth: string // "MM"
  expiryYear: string // "AAAA"
  ccv: string
}

interface Customer {
  name: string
  cpf: string
  email: string
  phone: string
  /** CEP só dígitos (cartão: creditCardHolderInfo). */
  postalCode: string
  /** Número do endereço (cartão: creditCardHolderInfo). */
  addressNumber: string
}

export interface EstacioChargeContext {
  enrollment: CreateEnrollmentInput
  offer: {
    offerId?: string
    courseName?: string
    brand?: string
    modality?: string
    city?: string
    state?: string
    academicLevel?: string
    monthlyPrice?: number
  }
}

interface EstacioPaymentProps {
  /** Valor da taxa em centavos — vem do servidor (page.tsx), nunca do cliente. */
  amountInCents: number
  customer: Customer
  context: EstacioChargeContext
  /** Chamado quando o pagamento é detectado — o pai confirma a inscrição. */
  onPaid: (externalTransactionId: string) => void
  /** Erro reportado pelo pai (ex.: recusa da Estácio depois do pagamento). */
  externalError?: string | null
  /** Enquanto o pai confirma a inscrição, o componente mostra "confirmando". */
  confirming?: boolean
}

interface ChargeState {
  externalTransactionId?: string
  brCode?: string
  brCodeBase64?: string
}

const POLL_INTERVAL_MS = 4000

const METHODS: Array<{ id: Method; label: string; icon: typeof QrCode; hint: string }> = [
  { id: 'pix', label: 'Pix', icon: QrCode, hint: 'Na hora' },
  { id: 'card', label: 'Cartão', icon: CreditCard, hint: 'Crédito' },
]

/** BRL exato (sem o ".99" do formatter de catálogo). */
function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    (cents || 0) / 100,
  )
}

function toDataUri(base64: string | undefined): string | undefined {
  if (!base64) return undefined
  return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
}

export default function EstacioPayment({
  amountInCents,
  customer,
  context,
  onPaid,
  externalError,
  confirming,
}: EstacioPaymentProps) {
  const [method, setMethod] = useState<Method>('pix')
  const [charges, setCharges] = useState<Partial<Record<Method, ChargeState>>>({})
  const [loadingMethod, setLoadingMethod] = useState<Method | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pixOpen, setPixOpen] = useState(false)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState(false)

  const paidRef = useRef(false)
  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid

  const confirmPaid = useCallback((externalId?: string) => {
    if (!externalId || paidRef.current) return
    paidRef.current = true
    setPaid(true)
    setPixOpen(false)
    onPaidRef.current(externalId)
  }, [])

  const createCharge = useCallback(
    async (m: Method, cardFields?: CardFields): Promise<ChargeState | null> => {
      setLoadingMethod(m)
      setError(null)
      try {
        const cpfDigits = customer.cpf.replace(/\D/g, '')
        const phoneDigits = customer.phone.replace(/\D/g, '')
        const res = await fetch('/api/athena-checkout/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollment: context.enrollment,
            offer: context.offer,
            paymentMethod: m,
            ...(m === 'card' && cardFields
              ? {
                  installmentCount: 1,
                  creditCard: cardFields,
                  creditCardHolderInfo: {
                    name: cardFields.holderName || customer.name,
                    email: customer.email,
                    cpfCnpj: cpfDigits,
                    postalCode: customer.postalCode.replace(/\D/g, ''),
                    addressNumber: customer.addressNumber,
                    mobilePhone: phoneDigits,
                  },
                }
              : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Não foi possível gerar a cobrança.')

        const charge: ChargeState = {
          externalTransactionId: data.transactionId,
          brCode: data.pixQrCode?.brCode,
          brCodeBase64: data.pixQrCode?.brCodeBase64,
        }
        setCharges((prev) => ({ ...prev, [m]: charge }))

        if (m === 'card') {
          const status = String(data.status || '').toUpperCase()
          if (data.paid === true || status === 'PAID') {
            confirmPaid(charge.externalTransactionId)
          } else if (status === 'FAILED') {
            setError('Pagamento recusado. Confira os dados do cartão ou tente outro.')
          }
        }
        return charge
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao gerar cobrança.')
        return null
      } finally {
        setLoadingMethod(null)
      }
    },
    [customer, context, confirmPaid],
  )

  const handlePix = useCallback(async () => {
    const existing = charges.pix
    const charge = existing ?? (await createCharge('pix'))
    if (charge?.brCodeBase64 || charge?.brCode) setPixOpen(true)
  }, [charges.pix, createCharge])

  const submitCard = useCallback(
    async (card: CardFields) => {
      await createCharge('card', card)
    },
    [createCharge],
  )

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  // Polling: pergunta à rota de confirmação se o pagamento já caiu. 202 =
  // ainda não; ok/recusa = o pai assume (via onPaid) e mostra o resultado.
  const pollables = useMemo(
    () =>
      (['pix', 'card'] as Method[])
        .map((m) => charges[m]?.externalTransactionId)
        .filter((id): id is string => Boolean(id)),
    [charges],
  )
  const pollKey = pollables.join(',')
  useEffect(() => {
    if (paid || pollables.length === 0) return
    let active = true
    const tick = async () => {
      for (const id of pollables) {
        try {
          const res = await fetch('/api/athena-checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ externalTransactionId: id }),
          })
          // 200 = inscrição criada; 422 = pagou e a Estácio recusou (o pai
          // mostra a recusa + estorno). 202 (pendente) e 5xx (falha
          // transitória) mantêm o polling — nunca dizemos "pago" por um erro
          // de servidor.
          if (active && (res.ok || res.status === 422)) {
            confirmPaid(id)
            return
          }
        } catch {
          /* tenta no próximo tick */
        }
      }
    }
    const interval = setInterval(tick, POLL_INTERVAL_MS)
    void tick()
    return () => {
      active = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, pollKey, confirmPaid])

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-white py-10 text-center">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-bolsa-secondary text-white">
          <Check className="h-7 w-7" strokeWidth={2.5} />
          <span className="absolute inset-0 animate-ping rounded-full bg-bolsa-secondary/30" />
        </span>
        <p className="font-display text-xl text-ink-900">Taxa de matrícula paga</p>
        {externalError ? (
          <p className="max-w-sm px-6 text-sm text-bolsa-secondary">{externalError}</p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-ink-500">
            {confirming !== false && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enviando sua inscrição para a Estácio…
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-hairline bg-white px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          Taxa de matrícula Bolsa Click
        </p>
        <p className="font-display num-tabular text-3xl leading-tight text-ink-900">
          {formatCents(amountInCents)}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
          Cobrança única do Bolsa Click, paga agora para garantir sua inscrição.{' '}
          <span className="text-ink-700">
            O boleto/PIX da Estácio referente ao curso é separado e vem depois, na tela seguinte.
          </span>
        </p>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          Forma de pagamento
        </p>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(({ id, label, icon: Icon, hint }) => {
            const active = method === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id)
                  setError(null)
                }}
                aria-pressed={active}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? 'border-bolsa-secondary bg-bolsa-secondary text-white'
                    : 'border-hairline bg-white text-ink-700 hover:border-ink-300'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-bolsa-secondary'}`} />
                <span className="text-sm font-semibold leading-none">{label}</span>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                    active ? 'text-white/70' : 'text-ink-300'
                  }`}
                >
                  {hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {(error || externalError) && (
        <p className="rounded-xl border border-bolsa-secondary/30 bg-bolsa-secondary/5 px-4 py-3 text-[13px] text-bolsa-secondary">
          {error || externalError}
        </p>
      )}

      <div className="min-h-[120px]">
        {method === 'pix' && (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-ink-700">
              Pague em segundos com o app do seu banco. A confirmação é{' '}
              <span className="text-ink-900">instantânea</span> e a inscrição segue na hora.
            </p>
            <button
              type="button"
              onClick={handlePix}
              disabled={loadingMethod === 'pix'}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-bolsa-secondary px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-bolsa-secondary/25 transition-all hover:bg-bolsa-secondary/90 disabled:cursor-not-allowed disabled:bg-ink-300"
            >
              {loadingMethod === 'pix' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando código…
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  {charges.pix ? 'Ver QR Code Pix' : `Pagar ${formatCents(amountInCents)} com Pix`}
                </>
              )}
            </button>
          </div>
        )}

        {method === 'card' && (
          <div>
            {charges.card ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-hairline bg-white text-center">
                <Loader2 className="h-7 w-7 animate-spin text-bolsa-secondary" />
                <p className="text-sm text-ink-700">Processando pagamento…</p>
              </div>
            ) : (
              <CardForm
                amountInCents={amountInCents}
                submitting={loadingMethod === 'card'}
                onSubmit={submitCard}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-ink-500">
        <Lock className="h-3.5 w-3.5" />
        Pagamento criptografado · <span className="text-ink-700">Bolsa&nbsp;Click</span>
      </div>

      {pixOpen && charges.pix && (
        <PixQrModal
          amountInCents={amountInCents}
          brCode={charges.pix.brCode}
          brCodeBase64={charges.pix.brCodeBase64}
          copied={copied}
          onCopy={() => charges.pix?.brCode && handleCopy(charges.pix.brCode)}
          onClose={() => setPixOpen(false)}
        />
      )}
    </div>
  )
}

interface CardFormProps {
  amountInCents: number
  submitting: boolean
  onSubmit: (card: CardFields) => void
}

function CardForm({ amountInCents, submitting, onSubmit }: CardFormProps) {
  const [holderName, setHolderName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [touched, setTouched] = useState(false)

  const digits = number.replace(/\D/g, '')
  const expMatch = /^(\d{2})\/(\d{2})$/.exec(expiry)
  const cardValid =
    holderName.trim().length >= 3 &&
    digits.length >= 13 &&
    digits.length <= 19 &&
    !!expMatch &&
    Number(expMatch[1]) >= 1 &&
    Number(expMatch[1]) <= 12 &&
    cvv.replace(/\D/g, '').length >= 3

  const formatNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
  }

  const handleSubmit = () => {
    setTouched(true)
    if (!cardValid || !expMatch) return
    onSubmit({
      holderName: holderName.trim().toUpperCase(),
      number: digits,
      expiryMonth: expMatch[1],
      expiryYear: `20${expMatch[2]}`,
      ccv: cvv.replace(/\D/g, ''),
    })
  }

  const inputBase =
    'w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-bolsa-secondary'
  const labelBase = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500'

  return (
    <div className="space-y-3">
      <div>
        <label className={labelBase}>Nome impresso no cartão</label>
        <input
          className={inputBase}
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder="Como está no cartão"
          autoComplete="cc-name"
        />
      </div>
      <div>
        <label className={labelBase}>Número do cartão</label>
        <input
          className={`${inputBase} font-mono num-tabular`}
          value={number}
          onChange={(e) => setNumber(formatNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          autoComplete="cc-number"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase}>Validade</label>
          <input
            className={`${inputBase} font-mono num-tabular`}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </div>
        <div>
          <label className={labelBase}>CVV</label>
          <input
            className={`${inputBase} font-mono num-tabular`}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {touched && !cardValid && (
        <p className="text-[12px] text-bolsa-secondary">Confira os dados do cartão.</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bolsa-secondary px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-bolsa-secondary/25 transition-all hover:bg-bolsa-secondary/90 disabled:cursor-not-allowed disabled:bg-ink-300"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processando…
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" /> Pagar {formatCents(amountInCents)}
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-500">
        <ShieldCheck className="h-3.5 w-3.5 text-bolsa-secondary" />
        Dados enviados de forma segura ao processador de pagamento.
      </p>
    </div>
  )
}

interface PixQrModalProps {
  amountInCents: number
  brCode?: string
  brCodeBase64?: string
  copied: boolean
  onCopy: () => void
  onClose: () => void
}

function PixQrModal({
  amountInCents,
  brCode,
  brCodeBase64,
  copied,
  onCopy,
  onClose,
}: PixQrModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-[26px] bg-white shadow-[0_40px_80px_-30px_rgba(11,31,60,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
            Pix · Taxa de matrícula
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-2 pt-1 text-center">
          <p className="font-display num-tabular text-2xl text-ink-900">
            {formatCents(amountInCents)}
          </p>
          <p className="text-[12px] text-ink-500">Escaneie com o app do seu banco</p>
        </div>

        <div className="flex justify-center px-6 pb-2">
          <div className="relative rounded-2xl bg-white p-4 shadow-[0_20px_40px_-30px_rgba(11,31,60,0.5)]">
            {brCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="QR Code Pix" src={toDataUri(brCodeBase64)} className="h-44 w-44" />
            ) : brCode ? (
              <QRCode value={brCode} size={176} bgColor="#ffffff" fgColor="#000000" level="M" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-bolsa-secondary" />
              </div>
            )}
          </div>
        </div>

        <div className="relative my-3">
          <div className="mx-6 border-t border-dashed border-ink-300/50" />
        </div>

        {brCode && (
          <div className="px-6">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Pix copia e cola
            </p>
            <p className="max-h-16 select-all overflow-y-auto break-all rounded-lg bg-paper-warm/70 p-2.5 font-mono text-[11px] leading-relaxed text-ink-700">
              {brCode}
            </p>
            <button
              type="button"
              onClick={onCopy}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-900/90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Código copiado' : 'Copiar código Pix'}
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 px-6 py-4 text-[11px] text-ink-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bolsa-secondary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bolsa-secondary" />
          </span>
          Aguardando pagamento — esta tela atualiza sozinha
        </div>
      </div>
    </div>
  )
}
