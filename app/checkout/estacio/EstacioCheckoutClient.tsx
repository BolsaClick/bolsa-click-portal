'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  User,
} from 'lucide-react'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'

/** Máscaras simples (CPF / telefone / CEP). */
const maskCpf = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const maskPhone = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')

const maskCep = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')

interface FormState {
  name: string
  cpf: string
  email: string
  mobile: string
  gender: '' | 'M' | 'F' | 'NI'
  rg: string
  birthDate: string
  zipCode: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  useEnem: boolean
  graduationYear: string
  acceptTerms: boolean
}

const initialForm: FormState = {
  name: '',
  cpf: '',
  email: '',
  mobile: '',
  gender: '',
  rg: '',
  birthDate: '',
  zipCode: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  useEnem: false,
  graduationYear: '',
  acceptTerms: false,
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors'
const labelClass =
  'block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5'

export default function EstacioCheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { trackEvent } = usePostHogTracking()

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
    }),
    [searchParams],
  )

  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    city: searchParams.get('city') ?? '',
    state: searchParams.get('state') ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [expanded, setExpanded] = useState({
    dados: true,
    endereco: false,
    ingresso: false,
  })

  const toggleSection = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    trackEvent('estacio_checkout_viewed', {
      offer_id: offer.offerId,
      course_name: offer.courseName,
      brand: offer.brand,
      modality: offer.modality,
      price: offer.price,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // Autofill de endereço via ViaCEP ao completar o CEP (8 dígitos).
  const handleCepBlur = async () => {
    const digits = form.zipCode.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      setCepLoading(true)
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data?.erro) {
        setForm((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }))
      }
    } catch {
      // silencioso — usuário preenche manualmente
    } finally {
      setCepLoading(false)
    }
  }

  // Estado das etapas (stepper)
  const dadosOk = !!(
    form.name.trim() &&
    form.cpf.replace(/\D/g, '').length === 11 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
    form.mobile.replace(/\D/g, '').length >= 10
  )
  const enderecoOk = !!(
    form.zipCode.replace(/\D/g, '').length === 8 &&
    form.street.trim() &&
    form.number.trim() &&
    form.neighborhood.trim() &&
    form.city.trim() &&
    form.state.trim()
  )

  const validate = (): string | null => {
    if (!offer.offerId) return 'Oferta inválida. Volte e selecione o curso novamente.'
    if (!form.name.trim()) return 'Informe seu nome completo.'
    if (form.cpf.replace(/\D/g, '').length !== 11) return 'CPF inválido.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'E-mail inválido.'
    if (form.mobile.replace(/\D/g, '').length < 10) return 'Telefone inválido.'
    if (form.zipCode.replace(/\D/g, '').length !== 8) return 'CEP inválido.'
    if (!form.street.trim()) return 'Informe o logradouro.'
    if (!form.number.trim()) return 'Informe o número.'
    if (!form.neighborhood.trim()) return 'Informe o bairro.'
    if (!form.city.trim()) return 'Informe a cidade.'
    if (!form.state.trim()) return 'Informe o estado (UF).'
    if (!form.acceptTerms) return 'É necessário aceitar os termos.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      // Abrir a seção relevante pra mostrar o erro
      if (!dadosOk) setExpanded((p) => ({ ...p, dados: true }))
      else if (!enderecoOk) setExpanded((p) => ({ ...p, endereco: true }))
      else setExpanded((p) => ({ ...p, ingresso: true }))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/athena-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.offerId,
          student: {
            name: form.name.trim(),
            cpf: form.cpf.replace(/\D/g, ''),
            email: form.email.trim(),
            mobile: form.mobile.replace(/\D/g, ''),
            gender: form.gender || undefined,
            rg: form.rg.trim() || undefined,
            birthDate: form.birthDate || undefined,
          },
          address: {
            street: form.street.trim(),
            number: form.number.trim(),
            neighborhood: form.neighborhood.trim(),
            zipCode: form.zipCode.replace(/\D/g, ''),
            state: form.state.trim().toUpperCase(),
            city: form.city.trim(),
          },
          options: {
            useEnem: form.useEnem,
            graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
            acceptTerms: form.acceptTerms,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Não foi possível concluir a inscrição.')
      }

      trackEvent('estacio_enrollment_created', {
        offer_id: offer.offerId,
        course_name: offer.courseName,
        numero_inscricao: data?.numeroInscricao ?? undefined,
        already_enrolled: !!data?.alreadyEnrolled,
      })

      const params = new URLSearchParams()
      if (offer.courseName) params.set('course', offer.courseName)
      if (data?.numeroInscricao) params.set('numeroInscricao', String(data.numeroInscricao))
      if (data?.paymentUrl) params.set('paymentUrl', String(data.paymentUrl))
      if (data?.pixCode) params.set('pixCode', String(data.pixCode))
      if (data?.amount) params.set('amount', String(data.amount))
      if (data?.dueDate) params.set('dueDate', String(data.dueDate))
      router.push(`/checkout/estacio/sucesso?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir a inscrição.')
      setSubmitting(false)
    }
  }

  const steps = [
    { n: '01', label: 'Estudante', done: dadosOk, active: !dadosOk },
    { n: '02', label: 'Endereço', done: enderecoOk, active: dadosOk && !enderecoOk },
    { n: '03', label: 'Ingresso', done: false, active: dadosOk && enderecoOk },
  ]

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
            Complete seus dados pra finalizar a inscrição. O valor da matrícula e das mensalidades é pago diretamente à instituição.
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
            <form onSubmit={handleSubmit}>
              {/* 01 · Dados do aluno */}
              <Section
                icon={<User size={15} />}
                step="01 · Estudante"
                title="Dados do aluno"
                open={expanded.dados}
                onToggle={() => toggleSection('dados')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nome completo</label>
                    <input className={inputClass} value={form.name}
                      onChange={(e) => set('name', e.target.value)} placeholder="Ex: Rodrigo Silva" />
                  </div>
                  <div>
                    <label className={labelClass}><Mail size={12} className="inline mr-1" />E-mail</label>
                    <input type="email" className={inputClass} value={form.email}
                      onChange={(e) => set('email', e.target.value)} placeholder="seuemail@exemplo.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Celular</label>
                    <input inputMode="numeric" className={inputClass} value={form.mobile}
                      onChange={(e) => set('mobile', maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className={labelClass}>CPF</label>
                    <input inputMode="numeric" className={inputClass} value={form.cpf}
                      onChange={(e) => set('cpf', maskCpf(e.target.value))} placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className={labelClass}>Data de nascimento</label>
                    <input type="date" className={inputClass} value={form.birthDate}
                      onChange={(e) => set('birthDate', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Gênero</label>
                    <select className={inputClass} value={form.gender}
                      onChange={(e) => set('gender', e.target.value as FormState['gender'])}>
                      <option value="">Prefiro não informar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="NI">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>RG</label>
                    <input className={inputClass} value={form.rg}
                      onChange={(e) => set('rg', e.target.value)} />
                  </div>
                </div>
              </Section>

              {/* 02 · Endereço */}
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
                      <input inputMode="numeric" className={inputClass} value={form.zipCode}
                        onChange={(e) => set('zipCode', maskCep(e.target.value))} onBlur={handleCepBlur}
                        placeholder="00000-000" />
                      {cepLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-ink-300" />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Logradouro</label>
                    <input className={inputClass} value={form.street}
                      onChange={(e) => set('street', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input className={inputClass} value={form.number}
                      onChange={(e) => set('number', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Bairro</label>
                    <input className={inputClass} value={form.neighborhood}
                      onChange={(e) => set('neighborhood', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Cidade</label>
                    <input className={inputClass} value={form.city}
                      onChange={(e) => set('city', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>UF</label>
                    <input maxLength={2} className={inputClass} value={form.state}
                      onChange={(e) => set('state', e.target.value.toUpperCase())} placeholder="SP" />
                  </div>
                </div>
              </Section>

              {/* 03 · Ingresso */}
              <Section
                icon={<GraduationCap size={15} />}
                step="03 · Ingresso"
                title="Forma de ingresso"
                open={expanded.ingresso}
                onToggle={() => toggleSection('ingresso')}
                last
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  <label className="flex items-center gap-2.5 text-[14px] text-ink-700 py-2">
                    <input type="checkbox" checked={form.useEnem}
                      onChange={(e) => set('useEnem', e.target.checked)} className="accent-bolsa-secondary" />
                    Quero usar a nota do ENEM
                  </label>
                  <div>
                    <label className={labelClass}>Ano de conclusão do ensino médio</label>
                    <input inputMode="numeric" className={inputClass} value={form.graduationYear}
                      onChange={(e) => set('graduationYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="2018" />
                  </div>
                </div>

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
                  className="group mt-5 w-full inline-flex items-center justify-center gap-3 bg-bolsa-secondary text-white py-4 px-6 rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 disabled:bg-ink-300 disabled:cursor-not-allowed shadow-lg shadow-bolsa-secondary/25 hover:shadow-bolsa-secondary/40 transition-all duration-300"
                >
                  {submitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando…
                    </span>
                  ) : (
                    <>
                      Concluir inscrição
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-ink-400 mt-3">
                  Após a inscrição, você será levado à página de pagamento da instituição.
                </p>
              </Section>
            </form>
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

            {offer.price > 0 && (
              <div className="bg-paper-warm border border-hairline rounded-2xl p-5 mb-5">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2 block">
                  Mensalidade com bolsa
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[14px] text-ink-700 font-medium">R$</span>
                  <span className="font-display num-tabular text-[40px] font-bold text-bolsa-secondary leading-none">
                    {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[12px] text-ink-500">/mês</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-3 italic">
                  Pago diretamente à instituição de ensino
                </p>
              </div>
            )}

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
              {(offer.city || offer.state) && (
                <li className="flex items-center gap-3 text-[13px] text-ink-700">
                  <MapPin size={14} className="text-ink-300 flex-shrink-0" />
                  {offer.city}
                  {offer.city && offer.state ? ' — ' : ''}
                  {offer.state}
                </li>
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
