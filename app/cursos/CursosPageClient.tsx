'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  GraduationCap,
  Search,
  TrendingUp,
  Clock,
  Banknote,
  X,
} from 'lucide-react'
import { FeaturedCourseListItem } from './_data/types'

interface CursosPageClientProps {
  courses: FeaturedCourseListItem[]
}

type TypeKey = 'TODOS' | 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'

const TYPE_LABEL: Record<Exclude<TypeKey, 'TODOS'>, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
}

const PARTNERS = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg' },
  { name: 'Unopar', src: '/assets/logo-unopar.svg' },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg' },
  { name: 'Ampli', src: '/assets/ampli-logo.png' },
  { name: 'Unime', src: '/assets/logo-unime-p.png' },
]

type Offer = {
  course: string
  institution: string
  logo: string
  modality: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  city: string
  uf: string
  finalPrice: number
  originalPrice: number
  discountPct: number
  href: string
}

const FEATURED_OFFERS: Offer[] = [
  {
    course: 'Pedagogia',
    institution: 'Pitágoras',
    logo: '/assets/logo-pitagoras.svg',
    modality: 'EAD',
    city: 'Belo Horizonte',
    uf: 'MG',
    finalPrice: 119,
    originalPrice: 950,
    discountPct: 87,
    href: '/curso/resultado?c=pedagogia&nivel=GRADUACAO&modalidade=EAD',
  },
  {
    course: 'Administração',
    institution: 'Ampli',
    logo: '/assets/ampli-logo.png',
    modality: 'EAD',
    city: 'Curitiba',
    uf: 'PR',
    finalPrice: 99.99,
    originalPrice: 1290,
    discountPct: 92,
    href: '/curso/resultado?c=administracao&nivel=GRADUACAO&modalidade=EAD',
  },
  {
    course: 'Análise e Desenvolvimento de Sistemas',
    institution: 'Anhanguera',
    logo: '/assets/logo-anhanguera-bolsa-click.svg',
    modality: 'EAD',
    city: 'Recife',
    uf: 'PE',
    finalPrice: 109,
    originalPrice: 1100,
    discountPct: 90,
    href: '/curso/resultado?c=analise-e-desenvolvimento-de-sistemas&nivel=GRADUACAO&modalidade=EAD',
  },
]

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: Offer['modality']) =>
  m === 'EAD' ? 'EAD' : m === 'SEMIPRESENCIAL' ? 'Semipresencial' : 'Presencial'

const stripSalary = (s: string) => s.split('a')[0].trim()

const demandChip = (d: FeaturedCourseListItem['marketDemand']) => {
  if (d === 'ALTA')
    return { label: 'Alta demanda', tone: 'bg-bolsa-secondary/10 text-bolsa-secondary' }
  if (d === 'MEDIA')
    return { label: 'Demanda estável', tone: 'bg-bolsa-primary/10 text-bolsa-primary' }
  return { label: 'Em ascensão', tone: 'bg-ink-100 text-ink-700' }
}

export default function CursosPageClient({ courses }: CursosPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<TypeKey>('TODOS')
  const catalogRef = useRef<HTMLElement>(null)

  const counts = useMemo(
    () => ({
      TODOS: courses.length,
      BACHARELADO: courses.filter((c) => c.type === 'BACHARELADO').length,
      LICENCIATURA: courses.filter((c) => c.type === 'LICENCIATURA').length,
      TECNOLOGO: courses.filter((c) => c.type === 'TECNOLOGO').length,
    }),
    [courses]
  )

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.areas.some((a) => a.toLowerCase().includes(q))
      const matchesType = selectedType === 'TODOS' || c.type === selectedType
      return matchesSearch && matchesType
    })
  }, [courses, searchTerm, selectedType])

  const filterTypes: TypeKey[] = ['TODOS', 'BACHARELADO', 'LICENCIATURA', 'TECNOLOGO']

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-40 w-[34rem] h-[34rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/60 inline-flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-white/30" />
              Catálogo de cursos
              <span className="h-px w-8 bg-white/30" />
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-white leading-[1.04] mb-5">
              O curso certo,{' '}
              <span className="italic text-white/85">com a bolsa que cabe.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed mb-9">
              Bacharelado, licenciatura ou tecnólogo — em mais de 30 mil faculdades parceiras.
              Descontos de até 80%, sem ENEM, sem fila e com diploma reconhecido pelo MEC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Explorar {counts.TODOS} cursos
                <ArrowRight size={18} />
              </button>
              <Link
                href="/curso/resultado"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-[15px]"
              >
                Buscar todas as bolsas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            <div className="px-4 py-8 md:py-10 text-center">
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                {counts.TODOS}+
              </div>
              <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                Cursos em destaque
              </div>
            </div>
            <div className="px-4 py-8 md:py-10 text-center">
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                30k+
              </div>
              <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                Faculdades parceiras
              </div>
            </div>
            <div className="px-4 py-8 md:py-10 text-center">
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                até 80%
              </div>
              <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                de desconto em bolsas
              </div>
            </div>
            <div className="px-4 py-8 md:py-10 text-center">
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                100%
              </div>
              <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                sem necessidade de ENEM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="bg-paper border-b border-hairline py-10">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 text-center mb-7">
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

      {/* OFERTAS EM DESTAQUE */}
      <section className="py-16 md:py-20 bg-paper">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-ink-300" />
                Ofertas em destaque
              </span>
              <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                Comece pelas mais procuradas.
              </h2>
              <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                Mensalidades já com bolsa aplicada, em faculdades reconhecidas pelo MEC.
              </p>
            </div>
            <Link
              href="/curso/resultado"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
            >
              Ver todas as ofertas
              <ArrowRight size={16} />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {FEATURED_OFFERS.map((o) => (
              <li key={`${o.course}-${o.institution}-${o.city}`} className="h-full">
                <Link
                  href={o.href}
                  className="group flex flex-col h-full bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="h-9 flex items-center">
                      <Image
                        src={o.logo}
                        alt={o.institution}
                        width={120}
                        height={36}
                        className="h-9 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bolsa-secondary text-white text-[11px] font-bold tracking-wide">
                      -{o.discountPct}%
                    </span>
                  </div>

                  <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
                    {o.course}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
                    <span>{modalityLabel(o.modality)}</span>
                    <span className="text-ink-300">·</span>
                    <span>
                      {o.city} — {o.uf}
                    </span>
                  </div>

                  <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                        Mensalidade com bolsa
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[13px] text-ink-700 font-medium">R$</span>
                        <span className="font-display num-tabular text-3xl font-bold text-bolsa-secondary leading-none">
                          {formatPrice(o.finalPrice)}
                        </span>
                        <span className="text-[12px] text-ink-500">/mês</span>
                      </div>
                      <div className="text-[12px] text-ink-300 line-through num-tabular mt-1">
                        De R$ {formatPrice(o.originalPrice)}
                      </div>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900 text-white group-hover:bg-bolsa-secondary transition-colors">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CATÁLOGO + FILTROS */}
      <section ref={catalogRef} className="bg-white py-16 md:py-20 border-y border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            <div className="md:col-span-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Catálogo completo
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                Encontre o curso{' '}
                <span className="italic text-ink-700">que combina com você.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 md:pt-3">
              <p className="text-ink-500 text-[15px] leading-relaxed">
                Filtre por tipo de graduação ou pesquise pelo nome do curso. Cada card mostra
                duração, salário médio e demanda do mercado — depois é só ver as bolsas
                disponíveis.
              </p>
            </div>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="border-y border-hairline py-5 mb-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="text"
                placeholder="Buscar por nome do curso ou área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-8 py-2 bg-transparent border-0 border-b border-transparent focus:border-ink-900 focus:outline-none text-ink-900 placeholder:text-ink-300 text-[15px] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900"
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="md:col-span-7 flex flex-wrap gap-2 md:justify-end">
              {filterTypes.map((t) => {
                const active = selectedType === t
                const label = t === 'TODOS' ? 'Todos' : TYPE_LABEL[t]
                const count = counts[t]
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`group inline-flex items-baseline gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-colors ${
                      active
                        ? 'bg-ink-900 border-ink-900 text-white'
                        : 'bg-white border-hairline text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`font-mono num-tabular text-[10px] tracking-wider ${
                        active ? 'text-white/60' : 'text-ink-500'
                      }`}
                    >
                      {String(count).padStart(2, '0')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RESULT META */}
          <div className="flex items-baseline justify-between mb-6">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
              {selectedType === 'TODOS' ? 'Todos os cursos' : TYPE_LABEL[selectedType]}
              {searchTerm && ` · "${searchTerm}"`}
            </span>
            <span className="font-mono num-tabular text-[11px] tracking-wider text-ink-700">
              {String(filtered.length).padStart(2, '0')} resultado
              {filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* COURSE GRID */}
          {filtered.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-hairline border border-hairline">
              {filtered.map((curso) => {
                const demand = demandChip(curso.marketDemand)
                return (
                  <li
                    key={curso.slug}
                    className="group relative h-full bg-white flex flex-col p-6 hover:bg-paper transition-colors"
                  >
                    {/* TOP META */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-700">
                        {TYPE_LABEL[curso.type]}
                      </span>
                      {curso.marketDemand === 'ALTA' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase text-bolsa-secondary">
                          <TrendingUp size={11} strokeWidth={2.5} />
                          Em alta
                        </span>
                      )}
                    </div>

                    {/* TITLE — stretched link cobre o card inteiro */}
                    <h3 className="font-display text-[22px] md:text-[24px] text-ink-900 leading-[1.15] mb-3 group-hover:text-bolsa-secondary transition-colors">
                      <Link
                        href={`/cursos/${curso.slug}`}
                        className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:before:ring-2 focus-visible:before:ring-bolsa-secondary"
                      >
                        {curso.name}
                      </Link>
                    </h3>

                    <p className="text-[14px] text-ink-500 leading-relaxed line-clamp-2 mb-5">
                      {curso.description}
                    </p>

                    {/* AREAS */}
                    {curso.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {curso.areas.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-paper-warm text-ink-700 text-[11px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* META ROW */}
                    <dl className="grid grid-cols-2 gap-3 mb-5">
                      <div>
                        <dt className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-500 mb-1 inline-flex items-center gap-1">
                          <Clock size={10} />
                          Duração
                        </dt>
                        <dd className="text-[13px] font-semibold text-ink-900 num-tabular">
                          {curso.duration}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-500 mb-1 inline-flex items-center gap-1">
                          <Banknote size={10} />
                          Salário médio
                        </dt>
                        <dd className="text-[13px] font-semibold text-bolsa-primary num-tabular">
                          {stripSalary(curso.averageSalary)}
                        </dd>
                      </div>
                    </dl>

                    {/* DEMAND CHIP */}
                    <span
                      className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-5 ${demand.tone}`}
                    >
                      {demand.label}
                    </span>

                    {/* CTAs */}
                    <div className="mt-auto pt-4 border-t border-hairline flex items-center justify-between gap-3">
                      <span className="text-[13px] font-semibold text-ink-700 group-hover:text-bolsa-secondary transition-colors inline-flex items-center gap-1">
                        Ver detalhes
                        <ArrowRight size={14} />
                      </span>
                      <Link
                        href={`/curso/resultado?c=${encodeURIComponent(
                          curso.apiCourseName
                        )}&nivel=${curso.nivel}`}
                        className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-bolsa-secondary text-white text-[12px] font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors"
                      >
                        Ver bolsas
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-20 border border-hairline rounded-2xl bg-paper">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Nada por aqui
                <span className="h-px w-8 bg-ink-300" />
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-ink-900 mb-2">
                Nenhum curso encontrado.
              </h3>
              <p className="text-ink-500 text-[15px] max-w-md mx-auto mb-6">
                Tente buscar por outro termo ou veja todas as opções no nosso buscador
                completo.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('TODOS')
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-hairline rounded-full text-[13px] font-semibold text-ink-900 hover:border-ink-900 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-16 md:py-20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/15 blur-3xl"
        />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-6 text-bolsa-secondary" />
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Não encontrou o seu curso{' '}
              <span className="italic text-white/85">aqui?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Temos mais de 30 mil opções na busca completa. Compare faculdades, modalidades e
              descontos em segundos — cadastro grátis, sem ENEM, sem compromisso.
            </p>
            <Link
              href="/curso/resultado"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar todas as bolsas
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
