'use client'

import { Course } from '@/app/interface/course'
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  MapPin,
  Star,
  TrendingUp,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FeaturedCourseData } from '../_data/types'
import { useVisitedCourses } from '@/app/lib/personalization/hooks'
import { getBrandLogo } from '@/app/lib/brand-logos'

interface CursoPageClientProps {
  cursoMetadata: FeaturedCourseData
  courseOffers: Course[]
}

const PARTNERS = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg' },
  { name: 'Unopar', src: '/assets/logo-unopar.svg' },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg' },
  { name: 'Ampli', src: '/assets/ampli-logo.png' },
  { name: 'Unime', src: '/assets/logo-unime-p.png' },
]

const MODALITIES = ['TODAS', 'EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'] as const
type ModalityFilter = (typeof MODALITIES)[number]

const modalityLabel = (m: string) => {
  const upper = m.toUpperCase()
  if (upper === 'EAD') return 'EAD'
  if (upper === 'SEMIPRESENCIAL') return 'Semipresencial'
  if (upper === 'PRESENCIAL') return 'Presencial'
  return m
}

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const typeLabel = (t: string) => {
  if (t === 'BACHARELADO') return 'Bacharelado'
  if (t === 'LICENCIATURA') return 'Licenciatura'
  if (t === 'TECNOLOGO') return 'Tecnólogo'
  return t
}

const demandLabel = (d: string) => {
  if (d === 'ALTA') return 'Alta'
  if (d === 'MEDIA') return 'Média'
  return 'Baixa'
}

export default function CursoPageClient({
  cursoMetadata,
  courseOffers,
}: CursoPageClientProps) {
  const [activeTab, setActiveTab] = useState<'areas' | 'skills' | 'careers'>('areas')
  const [selectedModality, setSelectedModality] = useState<ModalityFilter>('TODAS')
  const router = useRouter()
  const infoSectionRef = useRef<HTMLElement>(null)
  const offersRef = useRef<HTMLElement>(null)
  const { recordVisit } = useVisitedCourses()

  useEffect(() => {
    recordVisit({ slug: cursoMetadata.slug, name: cursoMetadata.name })
  }, [cursoMetadata.slug, cursoMetadata.name, recordVisit])

  const filteredOffers =
    selectedModality === 'TODAS'
      ? courseOffers
      : courseOffers.filter((o) => o.modality === selectedModality)

  const minPrice =
    filteredOffers.length > 0
      ? Math.min(
          ...filteredOffers.map((o) => o.minPrice || 0).filter((p) => p > 0)
        )
      : 0

  const handleQueroEssaBolsa = () => {
    if (courseOffers.length > 0 && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(
        `/curso/resultado?c=${cursoMetadata.name}&nivel=${cursoMetadata.nivel}`
      )
    }
  }

  const handleSaibaMais = () => {
    infoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVerOferta = (offer: Course) => {
    router.push(
      `/curso/resultado?c=${cursoMetadata.name}&nivel=${cursoMetadata.nivel}&modalidade=${offer.modality}`
    )
  }

  const tabs = [
    { id: 'areas' as const, label: 'Áreas de atuação', items: cursoMetadata.areas },
    { id: 'skills' as const, label: 'Habilidades', items: cursoMetadata.skills },
    { id: 'careers' as const, label: 'Carreiras', items: cursoMetadata.careerPaths },
  ]

  const activeTabData = tabs.find((t) => t.id === activeTab)!

  const stats = [
    { label: 'Duração', value: cursoMetadata.duration },
    { label: 'Formação', value: typeLabel(cursoMetadata.type) },
    {
      label: minPrice > 0 ? 'A partir de' : 'Salário médio',
      value:
        minPrice > 0
          ? `R$ ${formatPrice(minPrice)}`
          : cursoMetadata.averageSalary.split('a')[0].trim(),
    },
    {
      label: courseOffers.length > 0 ? 'Ofertas ativas' : 'Demanda',
      value:
        courseOffers.length > 0
          ? String(courseOffers.length)
          : demandLabel(cursoMetadata.marketDemand),
    },
  ]

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
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-white leading-[1.05] mb-5">
              {cursoMetadata.fullName}
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              {cursoMetadata.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleQueroEssaBolsa}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                {courseOffers.length > 0 ? 'Ver ofertas disponíveis' : 'Quero essa bolsa'}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleSaibaMais}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-[15px]"
              >
                Sobre o curso
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {stats.map((s, i) => (
              <div key={i} className="px-4 py-8 md:py-10 text-center">
                <div className="font-display num-tabular text-2xl md:text-3xl text-ink-900 leading-none">
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

      {/* OFERTAS REAIS DA API */}
      {courseOffers.length > 0 && (
        <section ref={offersRef} className="py-16 md:py-20 bg-paper">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
              <div>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-ink-300" />
                  Ofertas disponíveis
                </span>
                <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                  {filteredOffers.length}{' '}
                  <span className="italic text-ink-700">
                    {filteredOffers.length === 1
                      ? 'oferta para'
                      : 'ofertas para'}
                  </span>{' '}
                  {cursoMetadata.name}
                </h2>
                <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                  Compare faculdades, modalidades e mensalidades — escolha a que cabe no seu plano.
                </p>
              </div>
            </div>

            {/* Filtro de modalidade */}
            <div className="flex flex-wrap gap-2 mb-8 hairline-b pb-4">
              {MODALITIES.map((m) => {
                const active = selectedModality === m
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedModality(m)}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                      active
                        ? 'bg-ink-900 text-white'
                        : 'bg-white border border-hairline text-ink-700 hover:border-ink-300 hover:text-ink-900'
                    }`}
                  >
                    {m === 'TODAS' ? 'Todas' : modalityLabel(m)}
                  </button>
                )
              })}
            </div>

            {filteredOffers.length === 0 ? (
              <div className="bg-white border border-hairline rounded-2xl p-10 text-center">
                <p className="text-ink-500 text-[15px]">
                  Nenhuma oferta encontrada nessa modalidade. Tente outro filtro.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch stagger-rise">
                {filteredOffers.map((offer, idx) => {
                  const hasPrice = offer.minPrice && offer.minPrice > 0
                  const brandLogo = getBrandLogo(offer.brand)
                  return (
                    <li key={`${offer.id}-${idx}`} className="h-full">
                      <button
                        type="button"
                        onClick={() => handleVerOferta(offer)}
                        className="card-lift group flex flex-col h-full w-full text-left bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300"
                      >
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div className="h-9 flex items-center min-w-0">
                            {brandLogo ? (
                              <Image
                                src={brandLogo}
                                alt={offer.brand || 'Faculdade Parceira'}
                                width={120}
                                height={36}
                                className="h-9 w-auto object-contain"
                                unoptimized
                              />
                            ) : (
                              <span className="text-[14px] font-bold text-ink-900 line-clamp-2 leading-tight">
                                {offer.brand || 'Faculdade Parceira'}
                              </span>
                            )}
                          </div>
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bolsa-primary/5 text-bolsa-primary text-[11px] font-bold tracking-wide uppercase">
                            {modalityLabel(offer.modality)}
                          </span>
                        </div>

                        <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
                          {cursoMetadata.fullName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {offer.unitCity && offer.unitState
                              ? `${offer.unitCity} — ${offer.unitState}`
                              : 'Várias localidades'}
                          </span>
                        </div>

                        <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
                          <div>
                            {hasPrice ? (
                              <>
                                <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                                  A partir de
                                </div>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-[13px] text-ink-700 font-medium">
                                    R$
                                  </span>
                                  <span className="font-display num-tabular text-3xl font-bold text-bolsa-secondary leading-none">
                                    {formatPrice(offer.minPrice)}
                                  </span>
                                  <span className="text-[12px] text-ink-500">/mês</span>
                                </div>
                                {offer.maxPrice && offer.maxPrice !== offer.minPrice && (
                                  <div className="text-[12px] text-ink-300 num-tabular mt-1">
                                    até R$ {formatPrice(offer.maxPrice)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-[13px] text-ink-500">Consulte valores</span>
                            )}
                          </div>
                          <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900 text-white group-hover:bg-bolsa-secondary transition-colors">
                            →
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* SOBRE + IMAGEM */}
      <section ref={infoSectionRef} className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center mb-16 max-w-6xl mx-auto">
            <div className="md:col-span-7 order-2 md:order-1">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Sobre o curso
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-5">
                O que é{' '}
                <span className="italic text-ink-700">{cursoMetadata.name}?</span>
              </h2>
              <p className="text-ink-700 text-[16px] leading-relaxed">
                {cursoMetadata.longDescription}
              </p>
            </div>

            <div className="md:col-span-5 order-1 md:order-2">
              <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-paper-warm border border-hairline">
                <Image
                  src={cursoMetadata.imageUrl}
                  alt={cursoMetadata.imageAlt || `Estudantes de ${cursoMetadata.name}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
              </div>
            </div>
          </div>

          {/* TABS — Áreas / Habilidades / Carreiras */}
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6 hairline-b pb-2">
              <div className="flex flex-wrap items-center gap-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-4 md:px-5 py-3 text-[13px] md:text-[14px] font-medium font-mono uppercase tracking-wide transition-colors ${
                        active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`absolute -bottom-2 left-0 right-0 h-[2px] bg-ink-900 transition-transform duration-300 origin-center ${
                          active ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <span className="font-mono num-tabular text-[11px] tracking-[0.2em] uppercase text-ink-500">
                ({String(activeTabData.items.length).padStart(2, '0')})
              </span>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
              {activeTabData.items.map((item, idx) => (
                <li
                  key={`${activeTab}-${idx}`}
                  className="bg-white px-5 py-4 flex items-start gap-3"
                >
                  <span className="flex-shrink-0 mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-bolsa-secondary/10 text-bolsa-secondary">
                    {activeTab === 'areas' && <Briefcase size={12} />}
                    {activeTab === 'skills' && <Star size={12} />}
                    {activeTab === 'careers' && <TrendingUp size={12} />}
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
            Faculdades parceiras com {cursoMetadata.name}
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

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-6 text-bolsa-secondary" />
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Pronto pra começar{' '}
              <span className="italic text-white/85">{cursoMetadata.name}?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Bolsas de estudo de até 80% em mais de 30 mil faculdades parceiras. Cadastro grátis,
              sem ENEM, sem complicação.
            </p>
            <button
              onClick={handleQueroEssaBolsa}
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar bolsas para {cursoMetadata.name}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
