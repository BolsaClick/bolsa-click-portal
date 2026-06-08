'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import {
  BadgeCheck,
  Barcode,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react'

type Method = 'pix' | 'card' | 'boleto'

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
  /** CEP (só usado no cartão, p/ creditCardHolderInfo). */
  postalCode?: string
  /** Número do endereço (só usado no cartão). */
  addressNumber?: string
}

interface MatriculaPaymentProps {
  /** Valor da matrícula em centavos. */
  amountInCents: number
  customer: Customer
  description: string
  metadata?: Record<string, unknown>
  /** Dados pessoais válidos (libera a geração da cobrança). */
  formReady: boolean
  /** Chamado quando o usuário tenta pagar sem os dados preenchidos. */
  onRequireData: () => void
  /** Chamado quando o pagamento é confirmado — o pai cria a inscrição. */
  onPaid: () => void
}

interface ChargeState {
  externalTransactionId?: string
  brCode?: string
  brCodeBase64?: string
  boletoUrl?: string
  boletoBarCode?: string
}

const POLL_INTERVAL_MS = 4000

const METHODS: Array<{ id: Method; label: string; icon: typeof QrCode; hint: string }> = [
  { id: 'pix', label: 'Pix', icon: QrCode, hint: 'Na hora' },
  { id: 'card', label: 'Cartão', icon: CreditCard, hint: 'Crédito' },
  { id: 'boleto', label: 'Boleto', icon: Barcode, hint: 'Até 3 dias' },
]

/** BRL exato (sem o ".99" do formatter de catálogo). */
function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    (cents || 0) / 100
  )
}

function toDataUri(base64: string | undefined): string | undefined {
  if (!base64) return undefined
  return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
}

export default function MatriculaPayment({
  amountInCents,
  customer,
  description,
  metadata,
  formReady,
  onRequireData,
  onPaid,
}: MatriculaPaymentProps) {
  const [method, setMethod] = useState<Method>('pix')
  const [charges, setCharges] = useState<Partial<Record<Method, ChargeState>>>({})
  const [loadingMethod, setLoadingMethod] = useState<Method | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pixOpen, setPixOpen] = useState(false)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const paidRef = useRef(false)
  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid

  const confirmPaid = useCallback(async (externalId?: string) => {
    if (paidRef.current) return
    paidRef.current = true
    setPaid(true)
    setPixOpen(false)

    // Meta Pixel + Conversions API - Purchase. eventID = externalId dedupa com
    // o Purchase server-side disparado em confirmPaidMatricula (mesmo id).
    const [firstName, ...rest] = (customer.name || '').trim().split(/\s+/)
    const courseId = typeof metadata?.courseId === 'string' ? metadata.courseId : undefined
    const courseName = typeof metadata?.courseName === 'string' ? metadata.courseName : description
    void trackFbqDual(
      'Purchase',
      {
        content_name: courseName,
        content_ids: courseId ? [courseId] : undefined,
        content_type: 'product',
        value: (amountInCents || 0) / 100,
        currency: 'BRL',
      },
      {
        email: customer.email,
        phone: customer.phone,
        externalId: customer.cpf.replace(/\D/g, ''),
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(' ') : undefined,
      },
      externalId,
    )

    // Dispara a confirmação server-side (cria inscrição + atualiza CRM).
    // Idempotente: o webhook do gateway/Elysium também cobre (aba fechada).
    if (externalId) {
      try {
        await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalTransactionId: externalId }),
        })
      } catch {
        /* o webhook server-side cobre */
      }
    }
    onPaidRef.current()
  }, [amountInCents, customer, description, metadata])

  const createCharge = useCallback(
    async (m: Method): Promise<ChargeState | null> => {
      setLoadingMethod(m)
      setError(null)
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customer.name,
            cpf: customer.cpf,
            email: customer.email,
            phone: customer.phone,
            amountInCents,
            description,
            paymentMethod: m,
            metadata,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Não foi possível gerar a cobrança.')
        const charge: ChargeState = {
          externalTransactionId: data.transactionId,
          brCode: data.pixQrCode?.brCode,
          brCodeBase64: data.pixQrCode?.brCodeBase64,
          // Boleto: shape do Elysium ainda não confirmado — leitura defensiva.
          boletoUrl: data.boleto?.url ?? data.boletoUrl ?? data.url,
          boletoBarCode:
            data.boleto?.barCode ?? data.boletoBarCode ?? data.barCode ?? data.boleto?.lineCode,
        }
        setCharges((prev) => ({ ...prev, [m]: charge }))
        return charge
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao gerar cobrança.')
        return null
      } finally {
        setLoadingMethod(null)
      }
    },
    [amountInCents, customer, description, metadata]
  )

  const ensureData = useCallback(() => {
    if (formReady) return true
    onRequireData()
    return false
  }, [formReady, onRequireData])

  const handleSelect = useCallback((m: Method) => {
    setMethod(m)
    setError(null)
  }, [])

  const handlePix = useCallback(async () => {
    if (!ensureData()) return
    const existing = charges.pix
    const charge = existing ?? (await createCharge('pix'))
    if (charge?.brCodeBase64 || charge?.brCode) setPixOpen(true)
  }, [ensureData, charges.pix, createCharge])

  const handleBoleto = useCallback(async () => {
    if (!ensureData()) return
    if (!charges.boleto) await createCharge('boleto')
  }, [ensureData, charges.boleto, createCharge])

  // Cartão transparente: envia os dados do cartão + parcelas ao Elysium (gateway).
  const submitCard = useCallback(
    async (card: CardFields, installments: number) => {
      if (!ensureData()) return
      setLoadingMethod('card')
      setError(null)
      try {
        const cpfDigits = customer.cpf.replace(/\D/g, '')
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customer.name,
            cpf: cpfDigits,
            email: customer.email,
            phone: customer.phone.replace(/\D/g, ''),
            amountInCents,
            description,
            paymentMethod: 'card',
            installmentCount: installments,
            creditCard: card,
            creditCardHolderInfo: {
              name: card.holderName || customer.name,
              email: customer.email,
              cpfCnpj: cpfDigits,
              postalCode: (customer.postalCode || '').replace(/\D/g, ''),
              addressNumber: customer.addressNumber || 'S/N',
              mobilePhone: customer.phone.replace(/\D/g, ''),
            },
            metadata,
          }),
        })
        const data = await res.json()
        // Erro do gateway (400): o portal repassa a razão útil em `error`.
        if (!res.ok) throw new Error(data?.error || 'Não foi possível processar o cartão.')

        const id: string | undefined = data.transactionId
        if (id) setCharges((prev) => ({ ...prev, card: { externalTransactionId: id } }))

        // Cartão Asaas é síncrono: resposta já traz paid/status.
        const status = String(data.status || '').toUpperCase()
        if (data.paid === true || status === 'PAID') {
          void confirmPaid(id)
        } else if (status === 'FAILED') {
          setError('Pagamento recusado. Confira os dados do cartão ou tente outro.')
        }
        // status PENDING (análise de risco): o polling (inclui 'card') confirma ao aprovar.
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao processar o cartão.')
      } finally {
        setLoadingMethod(null)
      }
    },
    [ensureData, customer, amountInCents, description, metadata, confirmPaid]
  )

  const handleCopy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  // Polling de status para PIX/boleto e cartão em análise de risco (PENDING).
  const pollables = useMemo(
    () =>
      (['pix', 'card', 'boleto'] as Method[])
        .map((m) => charges[m]?.externalTransactionId)
        .filter((id): id is string => Boolean(id)),
    [charges]
  )
  const pollKey = pollables.join(',')
  useEffect(() => {
    if (paid || pollables.length === 0) return
    let active = true
    const tick = async () => {
      for (const id of pollables) {
        try {
          const res = await fetch(`/api/checkout/status/${id}`)
          if (!res.ok) continue
          const data = await res.json()
          if (active && String(data.status).toUpperCase() === 'PAID') {
            void confirmPaid(id)
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-paper py-10 text-center animate-[scale-in_0.35s_ease-out]">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-bolsa-secondary text-white">
          <Check className="h-7 w-7" strokeWidth={2.5} />
          <span className="absolute inset-0 animate-ping rounded-full bg-bolsa-secondary/30" />
        </span>
        <p className="font-display text-xl text-ink-900">Pagamento confirmado</p>
        <p className="flex items-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Finalizando sua matrícula…
        </p>
      </div>
    )
  }

  const boletoCharge = charges.boleto

  return (
    <div className="space-y-5">
      {/* Comprovante: valor da matrícula */}
      <div className="hairline rounded-2xl bg-paper-warm/70 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          Valor da matrícula
        </p>
        <p className="font-display num-tabular text-3xl leading-tight text-ink-900">
          {formatCents(amountInCents)}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-500">Pago uma única vez para garantir sua vaga.</p>
      </div>

      {/* Seletor de método */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          Forma de pagamento
        </p>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(({ id, label, icon: Icon, hint }) => {
            const active = method === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                aria-pressed={active}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? 'border-bolsa-primary bg-bolsa-primary text-white shadow-[0_18px_30px_-22px_rgba(2,62,115,0.7)]'
                    : 'border-hairline bg-white text-ink-700 hover:border-ink-300'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-bolsa-primary'}`} />
                <span className="text-sm font-semibold leading-none">{label}</span>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                    active ? 'text-white/70' : 'text-ink-300'
                  }`}
                >
                  {hint}
                </span>
                {active && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-bolsa-secondary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Aviso de dados incompletos */}
      {!formReady && (
        <p className="rounded-xl border border-dashed border-ink-300/60 bg-paper px-4 py-3 text-[13px] text-ink-500">
          Preencha seus dados pessoais e endereço acima para liberar o pagamento.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-bolsa-secondary/30 bg-bolsa-secondary/5 px-4 py-3 text-[13px] text-bolsa-secondary">
          {error}
        </p>
      )}

      {/* Conteúdo por método */}
      <div className="min-h-[120px]">
        {/* PIX — o QR abre em modal */}
        {method === 'pix' && (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-ink-700">
              Pague em segundos com o app do seu banco. A confirmação é{' '}
              <span className="text-ink-900">instantânea</span> — sua matrícula é concluída na hora.
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
                  {charges.pix ? 'Ver QR Code Pix' : 'Gerar QR Code Pix'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Cartão — formulário transparente (dados vão ao gateway via Elysium) */}
        {method === 'card' && (
          <div>
            {!formReady ? (
              <p className="text-[13px] text-ink-500">
                Preencha seus dados acima para pagar com cartão.
              </p>
            ) : charges.card ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-hairline bg-white text-center">
                <Loader2 className="h-7 w-7 animate-spin text-bolsa-primary" />
                <p className="text-sm text-ink-700">Processando pagamento…</p>
                <WaitingHint label="Confirmando com o emissor" />
              </div>
            ) : (
              <CardForm
                amountInCents={amountInCents}
                maxInstallments={12}
                submitting={loadingMethod === 'card'}
                onSubmit={submitCard}
              />
            )}
          </div>
        )}

        {/* Boleto — inline */}
        {method === 'boleto' && (
          <div className="space-y-3">
            {!boletoCharge ? (
              <>
                <p className="text-[13px] leading-relaxed text-ink-700">
                  Gere o boleto e pague em qualquer banco, lotérica ou app. A vaga é confirmada após
                  a compensação (até 3 dias úteis).
                </p>
                <button
                  type="button"
                  onClick={handleBoleto}
                  disabled={loadingMethod === 'boleto'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bolsa-secondary px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-bolsa-secondary/25 transition-all hover:bg-bolsa-secondary/90 disabled:cursor-not-allowed disabled:bg-ink-300"
                >
                  {loadingMethod === 'boleto' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Gerando boleto…
                    </>
                  ) : (
                    <>
                      <Barcode className="h-4 w-4" /> Gerar boleto
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-3 animate-[fade-in_0.3s_ease-out]">
                <div className="overflow-hidden rounded-xl border border-hairline bg-white">
                  <div className="flex items-end gap-[2px] border-b border-hairline px-4 pb-3 pt-4">
                    {/* barras decorativas (apenas estética de boleto) */}
                    {Array.from({ length: 48 }).map((_, i) => (
                      <span
                        key={i}
                        className="block w-[2px] bg-ink-900"
                        style={{ height: `${(i * 7) % 5 === 0 ? 26 : (i % 3) * 8 + 10}px` }}
                      />
                    ))}
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      Linha digitável
                    </p>
                    <p className="select-all break-all font-mono text-[12px] leading-relaxed text-ink-900">
                      {boletoCharge.boletoBarCode || 'Disponível no boleto'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {boletoCharge.boletoBarCode && (
                    <button
                      type="button"
                      onClick={() => handleCopy('boleto', boletoCharge.boletoBarCode!)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300"
                    >
                      {copied === 'boleto' ? <Check className="h-4 w-4 text-bolsa-primary" /> : <Copy className="h-4 w-4" />}
                      {copied === 'boleto' ? 'Copiado' : 'Copiar'}
                    </button>
                  )}
                  {boletoCharge.boletoUrl && (
                    <a
                      href={boletoCharge.boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-bolsa-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-bolsa-primary/90"
                    >
                      <ExternalLink className="h-4 w-4" /> Abrir boleto
                    </a>
                  )}
                </div>
                <WaitingHint label="Aguardando compensação do boleto" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selo de segurança */}
      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-ink-500">
        <Lock className="h-3.5 w-3.5" />
        Pagamento criptografado · <span className="text-ink-700">Bolsa&nbsp;Click</span>
      </div>

      {/* Único modal: o QR Code Pix */}
      {pixOpen && charges.pix && (
        <PixQrModal
          amountInCents={amountInCents}
          brCode={charges.pix.brCode}
          brCodeBase64={charges.pix.brCodeBase64}
          copied={copied === 'pix'}
          onCopy={() => charges.pix?.brCode && handleCopy('pix', charges.pix.brCode)}
          onClose={() => setPixOpen(false)}
        />
      )}
    </div>
  )
}

interface CardFormProps {
  amountInCents: number
  maxInstallments: number
  submitting: boolean
  onSubmit: (card: CardFields, installments: number) => void
}

function CardForm({ amountInCents, maxInstallments, submitting, onSubmit }: CardFormProps) {
  const [holderName, setHolderName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [installments, setInstallments] = useState(1)
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
    v
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim()

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
  }

  const handleSubmit = () => {
    setTouched(true)
    if (!cardValid || !expMatch) return
    onSubmit(
      {
        holderName: holderName.trim().toUpperCase(),
        number: digits,
        expiryMonth: expMatch[1],
        expiryYear: `20${expMatch[2]}`,
        ccv: cvv.replace(/\D/g, ''),
      },
      installments
    )
  }

  const inputBase =
    'w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-bolsa-primary'
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
      <div>
        <label className={labelBase}>Parcelas</label>
        <select
          className={inputBase}
          value={installments}
          onChange={(e) => setInstallments(Number(e.target.value))}
        >
          {Array.from({ length: maxInstallments }).map((_, i) => {
            const n = i + 1
            return (
              <option key={n} value={n}>
                {n}x de {formatCents(Math.round(amountInCents / n))}
                {n === 1 ? ' à vista' : ' sem juros'}
              </option>
            )
          })}
        </select>
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
        <ShieldCheck className="h-3.5 w-3.5 text-bolsa-primary" />
        Dados enviados de forma segura ao processador de pagamento.
      </p>
    </div>
  )
}

function WaitingHint({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] text-ink-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bolsa-secondary/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-bolsa-secondary" />
      </span>
      {label}
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

function PixQrModal({ amountInCents, brCode, brCodeBase64, copied, onCopy, onClose }: PixQrModalProps) {
  // Fecha com ESC.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/55 p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="grain-overlay relative w-full max-w-sm overflow-hidden rounded-[26px] bg-paper shadow-[0_40px_80px_-30px_rgba(11,31,60,0.6)] animate-[scale-in_0.3s_cubic-bezier(0.22,1,0.36,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
            Pix · Matrícula
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
          <p className="font-display num-tabular text-2xl text-ink-900">{formatCents(amountInCents)}</p>
          <p className="text-[12px] text-ink-500">Escaneie com o app do seu banco</p>
        </div>

        {/* QR com cantoneiras de scanner */}
        <div className="flex justify-center px-6 pb-2">
          <div className="relative rounded-2xl bg-white p-4 shadow-[0_20px_40px_-30px_rgba(11,31,60,0.5)]">
            <Corner className="left-1.5 top-1.5" />
            <Corner className="right-1.5 top-1.5 rotate-90" />
            <Corner className="bottom-1.5 right-1.5 rotate-180" />
            <Corner className="bottom-1.5 left-1.5 -rotate-90" />
            {brCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="QR Code Pix" src={toDataUri(brCodeBase64)} className="h-44 w-44" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-bolsa-primary" />
              </div>
            )}
          </div>
        </div>

        {/* divisória picotada de comprovante */}
        <div className="relative my-3">
          <div className="mx-6 border-t border-dashed border-ink-300/50" />
          <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-ink-900/55" />
          <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-ink-900/55" />
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
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-bolsa-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-bolsa-primary/90"
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
          <BadgeCheck className="h-3.5 w-3.5 text-bolsa-primary" />
        </div>
      </div>
    </div>
  )
}

function Corner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-4 w-4 border-l-2 border-t-2 border-bolsa-primary/70 ${className}`}
    />
  )
}
