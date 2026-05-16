'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Check,
  GraduationCap,
  MapPin,
  Monitor,
} from 'lucide-react'
import type { VitrineCourse } from '@/app/lib/api/get-vitrine'

const STATS = [
  { value: '+2.000', label: 'Cursos profissionalizantes' },
  { value: '6 a 18', label: 'meses de duração' },
  { value: 'até 70%', label: 'de desconto em bolsas' },
  { value: '100%', label: 'sem ENEM ou seleção' },
]

const BRAND_LOGOS: Record<string, string> = {
  ANHANGUERA: '/assets/logo-anhanguera-bolsa-click.svg',
  UNOPAR: '/assets/logo-unopar.svg',
  PITAGORAS: '/assets/logo-pitagoras.svg',
  AMPLI: '/assets/ampli-logo.png',
  UNIME: '/assets/logo-unime-p.png',
}

const AREAS = [
  {
    n: '01',
    title: 'Administrativo',
    description: 'Auxiliar administrativo, gestão de pessoas, atendimento, secretariado, vendas. Cursos práticos pra entrar em qualquer empresa.',
  },
  {
    n: '02',
    title: 'Saúde e Cuidados',
    description: 'Cuidador de idosos, técnico de enfermagem, atendente de farmácia. Áreas em alta demanda no Brasil inteiro.',
  },
  {
    n: '03',
    title: 'Indústria e Logística',
    description: 'Eletricista, mecânico, soldador, almoxarife, operador de empilhadeira. Profissões com vagas em todo canto.',
  },
]

const REASONS = [
  {
    label: 'Rápido',
    title: 'Em meses, no mercado',
    description: 'A maioria dos cursos dura de 6 a 12 meses. Você se qualifica e começa a trabalhar muito antes que numa graduação.',
  },
  {
    label: 'Prático',
    title: 'Aprende fazendo',
    description: 'Conteúdo focado nas demandas reais das empresas. Sem teoria longa — habilidades que você usa no primeiro dia de trabalho.',
  },
  {
    label: 'Acessível',
    title: 'Cabe no bolso',
    description: 'Mensalidades a partir de R$ 69. Sem necessidade de ENEM, vestibular ou prova de seleção. Cadastro grátis.',
  },
]

const PARTNERS = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg' },
  { name: 'Unopar', src: '/assets/logo-unopar.svg' },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg' },
  { name: 'Ampli', src: '/assets/ampli-logo.png' },
  { name: 'Unime', src: '/assets/logo-unime-p.png' },
]

const FAQ = [
  {
    q: 'O que é um curso profissionalizante?',
    a: 'É um curso com foco em competências técnicas e práticas, voltado pra preparar você pra atuar em uma função específica do mercado de trabalho. Mais curto que graduação ou técnico.',
  },
  {
    q: 'Tem bolsa pra cursos profissionalizantes?',
    a: 'Sim. No Bolsa Click você compara opções com descontos de até 70% e escolhe a melhor condição. Cadastro 100% gratuito.',
  },
  {
    q: 'Preciso de ensino médio completo?',
    a: 'Depende do curso. A maioria dos profissionalizantes não exige ensino médio completo, mas alguns têm pré-requisitos específicos. Verifique antes de se inscrever.',
  },
  {
    q: 'Profissionalizante é a mesma coisa que técnico?',
    a: 'Não. O técnico é uma formação mais longa (1 a 2 anos) reconhecida pelo MEC com diploma. O profissionalizante é mais curto (6 a 18 meses), com certificado de qualificação.',
  },
  {
    q: 'Posso fazer EAD?',
    a: 'Sim, a maioria dos cursos profissionalizantes tem opção EAD. Alguns que envolvem prática (como eletricista ou cuidador) podem ter encontros presenciais ou semipresenciais.',
  },
]

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: VitrineCourse['modality']) =>
  m === 'EAD' ? 'EAD' : m === 'SEMIPRESENCIAL' ? 'Semipresencial' : 'Presencial'

const buildOfferHref = (o: VitrineCourse) => {
  const params = new URLSearchParams()
  params.set('c', o.searchTerm)
  params.set('nivel', o.academicLevel)
  if (o.modality) params.set('modalidade', o.modality)
  return `/curso/resultado?${params.toString()}`
}

type Props = {
  offers: VitrineCourse[]
}

export default function CursosProfissionalizantesClient({ offers }: Props) {
  const router = useRouter()
  const offersRef = useRef<HTMLElement>(null)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

  const handleBuscar = () => {
    router.push('/curso/resultado?nivel=CURSO_PROFISSIONALIZANTE')
  }

  const handleVerOfertas = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-5">
              Qualifique-se rápido,{' '}
              <span className="italic text-white/85">entre no mercado já.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              Cursos práticos com foco em empregabilidade — administração, saúde, logística,
              indústria. Mensalidades a partir de R$ 69, sem ENEM, sem fila.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuscar}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Buscar cursos com bolsa
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleVerOfertas}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-[15px]"
              >
                Ver ofertas em destaque
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 py-8 md:py-10 text-center">
                <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                  {s.value}
                </div>
                <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS */}
      <section ref={offersRef} className="py-16 md:py-20 bg-paper">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-ink-300" />
                Cursos profissionalizantes
              </span>
              <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                Ofertas em destaque
              </h2>
              <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                Os cursos mais procurados, com bolsa garantida e mensalidades a partir de R$ 69.
              </p>
            </div>
            <Link
              href="/curso/resultado?nivel=CURSO_PROFISSIONALIZANTE"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
            >
              Ver todas as ofertas
              <ArrowRight size={16} />
            </Link>
          </div>

          {offers.length === 0 ? (
            <div className="bg-white border border-hairline rounded-2xl p-10 text-center">
              <p className="text-ink-500 text-[15px] mb-6">
                Não conseguimos carregar as ofertas em destaque agora. Veja todas no catálogo.
              </p>
              <Link
                href="/curso/resultado?nivel=CURSO_PROFISSIONALIZANTE"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] hover:bg-bolsa-secondary/90 transition-colors"
              >
                Ver todos os profissionalizantes
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
              {offers.map((o) => {
                const brandKey = (o.brand || '').toUpperCase()
                const logo = BRAND_LOGOS[brandKey]
                const monthly = o.durationInMonths && o.durationInMonths > 0
                  ? o.minPrice / o.durationInMonths
                  : o.minPrice
                const monthlyFull = o.durationInMonths && o.durationInMonths > 0
                  ? o.maxPrice / o.durationInMonths
                  : o.maxPrice
                return (
                  <li key={`${o.id}-${o.searchTerm}`} className="h-full">
                    <Link
                      href={buildOfferHref(o)}
                      className="group flex flex-col h-full bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="h-9 flex items-center">
                          {logo ? (
                            <Image
                              src={logo}
                              alt={o.brand}
                              width={120}
                              height={36}
                              className="h-9 w-auto object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="inline-flex items-center gap-2 text-ink-700">
                              <GraduationCap size={18} />
                              <span className="font-display text-[15px] font-semibold">
                                {o.brand || 'Bolsa Click'}
                              </span>
                            </span>
                          )}
                        </div>
                        {o.discountPct > 0 && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bolsa-secondary text-white text-[11px] font-bold tracking-wide">
                            -{o.discountPct}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
                        {o.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
                        <span className="inline-flex items-center gap-1">
                          <Monitor size={14} />
                          {modalityLabel(o.modality)}
                        </span>
                        {o.city && o.uf && (
                          <>
                            <span className="text-ink-300">·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} />
                              {o.city} — {o.uf}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                            Mensalidade com bolsa
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-[13px] text-ink-700 font-medium">R$</span>
                            <span className="font-display num-tabular text-3xl font-bold text-bolsa-secondary leading-none">
                              {formatPrice(monthly)}
                            </span>
                            <span className="text-[12px] text-ink-500">/mês</span>
                          </div>
                          {monthlyFull > monthly && (
                            <div className="text-[12px] text-ink-300 line-through num-tabular mt-1">
                              De R$ {formatPrice(monthlyFull)}
                            </div>
                          )}
                        </div>
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900 text-white group-hover:bg-bolsa-secondary transition-colors">
                          →
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ÁREAS */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Áreas em destaque
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                Profissões com vagas{' '}
                <span className="italic text-ink-700">em todo o Brasil.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 md:pt-3">
              <p className="text-ink-500 text-[15px] leading-relaxed">
                Áreas em alta demanda no mercado — qualifique-se onde tem vaga e seja chamado pra
                entrevista logo após a formação.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline">
            {AREAS.map((a) => (
              <li
                key={a.n}
                className="px-2 md:px-6 py-8 md:py-10 border-b border-hairline md:border-r last:md:border-r-0"
              >
                <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-700 mb-5 block">
                  {a.n}
                </span>
                <h3 className="font-display text-2xl md:text-[28px] text-ink-900 leading-tight mb-3">
                  {a.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">{a.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* POR QUE — 3 razões */}
      <section className="bg-paper-warm py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              Por que profissionalizante
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
              Pra quem quer trabalhar{' '}
              <span className="italic text-ink-700">o quanto antes.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
            {REASONS.map((r) => (
              <article key={r.label} className="bg-white p-7 md:p-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-bolsa-primary/5 text-bolsa-primary text-[11px] font-bold tracking-wider uppercase mb-4">
                  {r.label}
                </span>
                <h3 className="font-display text-xl md:text-[22px] text-ink-900 leading-tight mb-3">
                  {r.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[14px]">{r.description}</p>
              </article>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <ul className="space-y-3 hairline-t pt-6">
              {[
                'Qualificação em meses, não anos',
                'Sem ENEM, sem vestibular, sem prova de seleção',
                'Mensalidades a partir de R$ 69 com bolsa',
                'Certificado válido em todo o Brasil',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-bolsa-secondary/10 text-bolsa-secondary">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-ink-700 text-[15px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="bg-paper border-y border-hairline py-12">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 text-center mb-8">
            Faculdades parceiras
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-70">
            {PARTNERS.map((p) => (
              <Image
                key={p.name}
                src={p.src}
                alt={p.name}
                width={140}
                height={36}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-28">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ink-300" />
                  FAQ
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-4">
                  Dúvidas sobre{' '}
                  <span className="italic text-ink-700">profissionalizantes?</span>
                </h2>
                <p className="text-ink-500 text-[15px] leading-relaxed">
                  Não achou a resposta? Comece a busca, compare ofertas e tira suas dúvidas direto
                  com a faculdade.
                </p>
              </div>
            </div>
            <div className="md:col-span-7">
              <ul className="border-t border-hairline">
                {FAQ.map((faq, idx) => {
                  const open = openFaqIdx === idx
                  return (
                    <li key={idx} className="border-b border-hairline">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(open ? null : idx)}
                        aria-expanded={open}
                        className="w-full flex items-start justify-between gap-6 py-6 text-left"
                      >
                        <span className="flex items-baseline gap-4 min-w-0">
                          <span className="font-mono num-tabular text-[11px] tracking-[0.2em] text-ink-500 pt-1">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-display text-xl md:text-2xl text-ink-900 leading-snug">
                            {faq.q}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all duration-200 ${
                            open ? 'rotate-45 border-ink-900 text-ink-900' : ''
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {open && (
                        <div className="pb-6 pl-10 pr-12">
                          <p className="text-ink-500 leading-relaxed text-[15px]">{faq.a}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-6 text-bolsa-secondary" />
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Pronto pra{' '}
              <span className="italic text-white/85">se qualificar?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Compare cursos profissionalizantes em segundos. Cadastro grátis, sem ENEM, com
              certificado válido em todo o Brasil.
            </p>
            <button
              onClick={handleBuscar}
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar cursos com bolsa
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
