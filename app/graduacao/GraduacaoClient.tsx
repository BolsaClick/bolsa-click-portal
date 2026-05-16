'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  GraduationCap,
  MapPin,
  Monitor,
} from 'lucide-react'
import type { VitrineCourse } from '@/app/lib/api/get-vitrine'

const STATS = [
  { value: '50k+', label: 'Cursos de graduação' },
  { value: '30k+', label: 'Faculdades parceiras' },
  { value: 'até 80%', label: 'de desconto em bolsas' },
  { value: '100%', label: 'sem necessidade de ENEM' },
]

const BRAND_LOGOS: Record<string, string> = {
  ANHANGUERA: '/assets/logo-anhanguera-bolsa-click.svg',
  UNOPAR: '/assets/logo-unopar.svg',
  PITAGORAS: '/assets/logo-pitagoras.svg',
  AMPLI: '/assets/ampli-logo.png',
  UNIME: '/assets/logo-unime-p.png',
}

const TYPES = [
  {
    n: '01',
    title: 'Bacharelado',
    duration: '4 a 5 anos',
    description: 'Formação ampla para atuar em diferentes áreas. Ideal pra quem quer um diploma versátil — Direito, Administração, Engenharia, Psicologia.',
  },
  {
    n: '02',
    title: 'Licenciatura',
    duration: '4 anos',
    description: 'Pra quem quer ser professor. Forma educadores pra educação básica e ensino médio — Pedagogia, Letras, Matemática, História.',
  },
  {
    n: '03',
    title: 'Tecnólogo',
    duration: '2 a 3 anos',
    description: 'Curso curto e prático, focado em uma área específica do mercado — ADS, Marketing, Logística, Recursos Humanos.',
  },
]

const MODALITIES = [
  {
    label: 'EAD',
    title: 'Ensino a distância',
    description: 'Estude online, no seu ritmo. Diploma reconhecido pelo MEC, com mensalidades a partir de R$ 99.',
  },
  {
    label: 'Presencial',
    title: 'Sala de aula tradicional',
    description: 'Contato direto com professores e colegas. Acesso a laboratórios e infraestrutura completa.',
  },
  {
    label: 'Semipresencial',
    title: 'O melhor dos dois mundos',
    description: 'Flexibilidade do EAD com encontros presenciais para práticas e networking.',
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
    q: 'Quanto tempo dura uma graduação?',
    a: 'Bacharelados e licenciaturas duram de 4 a 5 anos. Tecnólogos têm duração de 2 a 3 anos. A duração varia conforme o curso e a modalidade.',
  },
  {
    q: 'Qual a diferença entre Bacharelado, Licenciatura e Tecnólogo?',
    a: 'Bacharelado forma pra atuar em várias áreas; licenciatura prepara professores; tecnólogo é curto e focado em uma especialidade do mercado.',
  },
  {
    q: 'Diploma EAD tem o mesmo valor do presencial?',
    a: 'Sim. Cursos EAD reconhecidos pelo MEC têm validade idêntica aos presenciais — não há distinção no diploma.',
  },
  {
    q: 'Preciso de nota do ENEM para conseguir bolsa?',
    a: 'Não. No Bolsa Click você encontra bolsas sem precisar do ENEM. Basta se cadastrar gratuitamente e escolher o curso.',
  },
  {
    q: 'Como funciona a bolsa de estudo?',
    a: 'Você busca o curso, compara preços e descontos de até 80%, escolhe a melhor opção e garante sua bolsa. Cadastro 100% gratuito.',
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

export default function GraduacaoClient({ offers }: Props) {
  const router = useRouter()
  const offersRef = useRef<HTMLElement>(null)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

  const handleBuscar = () => {
    router.push('/curso/resultado?nivel=GRADUACAO')
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
              A graduação que abre{' '}
              <span className="italic text-white/85">portas pra você.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              Bacharelado, licenciatura ou tecnólogo — em mais de 30 mil faculdades parceiras.
              Sem ENEM, sem fila, com diploma reconhecido pelo MEC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuscar}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Buscar bolsas de graduação
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

      {/* OFERTAS EM DESTAQUE */}
      <section ref={offersRef} className="py-16 md:py-20 bg-paper">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-ink-300" />
                Cursos de graduação
              </span>
              <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                Ofertas em destaque
              </h2>
              <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                Os cursos de graduação mais procurados, com bolsa garantida e mensalidades reduzidas.
              </p>
            </div>
            <Link
              href="/curso/resultado?nivel=GRADUACAO"
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
                href="/curso/resultado?nivel=GRADUACAO"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] hover:bg-bolsa-secondary/90 transition-colors"
              >
                Ver todas as graduações
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
                  <li key={`${o.id}-${o.searchTerm}-${o.modality}`} className="h-full">
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

      {/* TIPOS DE GRADUAÇÃO */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Tipos de graduação
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                Três caminhos.{' '}
                <span className="italic text-ink-700">Mesmo ensino superior.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 md:pt-3">
              <p className="text-ink-500 text-[15px] leading-relaxed">
                Bacharelado, licenciatura e tecnólogo formam a base do ensino superior brasileiro.
                Todos com diploma reconhecido pelo MEC e aceitos no mercado de trabalho.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline">
            {TYPES.map((t) => (
              <li
                key={t.n}
                className="px-2 md:px-6 py-8 md:py-10 border-b border-hairline md:border-r last:md:border-r-0"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-700">
                    {t.n}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                    {t.duration}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-[28px] text-ink-900 leading-tight mb-3">
                  {t.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">{t.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="bg-paper-warm py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              Modalidades
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
              Estude do jeito{' '}
              <span className="italic text-ink-700">que cabe no seu dia.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
            {MODALITIES.map((m) => (
              <article key={m.label} className="bg-white p-7 md:p-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-bolsa-primary/5 text-bolsa-primary text-[11px] font-bold tracking-wider uppercase mb-4">
                  {m.label}
                </span>
                <h3 className="font-display text-xl md:text-[22px] text-ink-900 leading-tight mb-3">
                  {m.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[14px]">{m.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE FAZER GRADUAÇÃO */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-5">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ink-300" />
                  Por quê
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                  Vale a pena fazer{' '}
                  <span className="italic text-ink-700">uma graduação?</span>
                </h2>
              </div>
              <div className="md:col-span-7 space-y-6">
                <p className="text-ink-700 text-[16px] leading-relaxed">
                  No Brasil, profissionais com graduação ganham em média{' '}
                  <span className="font-semibold text-ink-900">2,5 vezes mais</span> do que
                  aqueles com apenas o ensino médio. A taxa de empregabilidade também é maior, e o
                  diploma abre portas pra cargos de liderança e concursos públicos.
                </p>
                <ul className="space-y-3 hairline-t pt-6">
                  {[
                    'Diploma reconhecido pelo MEC, aceito em todo o Brasil',
                    'Acesso a concursos públicos e cargos de gestão',
                    'Especialização e pós-graduação como próximos passos',
                    'Bolsas de até 80% no Bolsa Click — sem ENEM, cadastro grátis',
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
                  <span className="italic text-ink-700">graduação?</span>
                </h2>
                <p className="text-ink-500 text-[15px] leading-relaxed">
                  Tirou todas as suas dúvidas? Comece sua busca e garanta a bolsa que cabe no seu plano.
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
            <GraduationCap className="w-12 h-12 mx-auto mb-6 text-bolsa-secondary" />
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Pronto pra escolher{' '}
              <span className="italic text-white/85">sua graduação?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Em poucos cliques você compara mensalidades, faculdades, modalidades e descontos.
              Cadastro grátis, sem ENEM, sem compromisso.
            </p>
            <button
              onClick={handleBuscar}
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar bolsas de graduação
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
