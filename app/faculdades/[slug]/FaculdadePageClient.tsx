'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  MapPin,
  Building2,
  Users,
  Calendar,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import CourseCardNew from '@/app/components/CourseCardNew'
import { Course } from '@/app/interface/course'
import type { InstitutionData } from '../_data/types'

type Props = {
  institution: InstitutionData
  initialCourses: Course[]
}

const modalityShortLabel: Record<string, string> = {
  EAD: 'EAD',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

const modalityFullLabel: Record<string, string> = {
  EAD: 'EAD (Ensino a Distância)',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

const levelLabels: Record<string, string> = {
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
}

const typeLabels: Record<string, string> = {
  PRIVADA: 'Instituição Privada',
  PUBLICA_FEDERAL: 'Instituição Pública Federal',
  PUBLICA_ESTADUAL: 'Instituição Pública Estadual',
}

const modalityDetail: Record<string, { title: (n: string) => string; body: (n: string) => string }> = {
  EAD: {
    title: (n) => `Cursos EAD na ${n}`,
    body: (n) =>
      `Os cursos EAD da Faculdade ${n} oferecem flexibilidade total pra você estudar de qualquer lugar. Aulas online, material digital e suporte de tutores — diploma com a mesma validade do presencial.`,
  },
  PRESENCIAL: {
    title: (n) => `Cursos Presenciais na ${n}`,
    body: (n) =>
      `Os cursos presenciais da Faculdade ${n} entregam experiência completa: infraestrutura moderna, laboratórios equipados e contato direto com professores e colegas.`,
  },
  SEMIPRESENCIAL: {
    title: (n) => `Cursos Semipresenciais na ${n}`,
    body: () =>
      `Combinam o melhor dos dois mundos — a flexibilidade do EAD com encontros presenciais periódicos pra atividades práticas e avaliações.`,
  },
}

export default function FaculdadePageClient({ institution, initialCourses }: Props) {
  const [selectedModality, setSelectedModality] = useState<string>('')
  const [visibleCount, setVisibleCount] = useState(6)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

  const institutionCourses = useMemo(() => {
    if (!selectedModality) return initialCourses
    const target = selectedModality.toUpperCase()
    return initialCourses.filter((c) => {
      const m = (c.modality ?? c.commercialModality ?? '').toUpperCase()
      return m === target
    })
  }, [initialCourses, selectedModality])

  const visibleCourses = institutionCourses.slice(0, visibleCount)

  const stats: Array<{ value: string; label: string }> = []
  if (institution.mecRating) stats.push({ value: `${institution.mecRating}/5`, label: 'Nota MEC' })
  if (institution.campusCount) stats.push({ value: `${institution.campusCount}+`, label: 'Polos / campus' })
  if (institution.studentCount) stats.push({ value: institution.studentCount, label: 'Alunos' })
  if (institution.coursesOffered) stats.push({ value: `${institution.coursesOffered}+`, label: 'Cursos' })

  const yearsActive = institution.founded ? new Date().getFullYear() - institution.founded : null

  const faqItems: Array<{ q: string; a: string }> = [
    {
      q: `Qual a nota da Faculdade ${institution.name} no MEC?`,
      a: institution.mecRating
        ? `A Faculdade ${institution.name} tem nota ${institution.mecRating} no MEC (escala 1 a 5), refletindo a qualidade do ensino.`
        : `Você pode consultar a nota MEC da Faculdade ${institution.name} direto no portal e-MEC.`,
    },
    {
      q: `Como conseguir bolsa de estudo na ${institution.name}?`,
      a: `Pelo Bolsa Click: busca o curso, escolhe a melhor oferta e se inscreve grátis. As bolsas chegam a 95% de desconto.`,
    },
    {
      q: `Quais cursos a Faculdade ${institution.name} oferece?`,
      a: `${institution.academicLevels
        .map((l) => (l === 'GRADUACAO' ? 'graduação' : 'pós-graduação'))
        .join(' e ')} nas modalidades ${institution.modalities
        .map((m) => (m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'presencial' : 'semipresencial'))
        .join(', ')}${institution.coursesOffered ? ` — mais de ${institution.coursesOffered} cursos disponíveis.` : '.'}`,
    },
    {
      q: `A ${institution.name} é reconhecida pelo MEC?`,
      a: `Sim. ${institution.mecRating ? `Nota institucional ${institution.mecRating}/5. ` : ''}${
        institution.emecLink ? 'Você pode verificar a situação direto no portal e-MEC.' : ''
      }`,
    },
    {
      q: `Quanto custa estudar na ${institution.name}?`,
      a: `Os valores variam por curso e modalidade. Pelo Bolsa Click, você encontra bolsas com até 80% de desconto na mensalidade.`,
    },
    {
      q: `A ${institution.name} tem cursos EAD?`,
      a: institution.modalities.includes('EAD')
        ? `Sim. A Faculdade ${institution.name} oferece cursos EAD — estude de qualquer lugar com flexibilidade.`
        : `Hoje a Faculdade ${institution.name} oferece cursos ${institution.modalities
            .map((m) => (m === 'PRESENCIAL' ? 'presencial' : 'semipresencial'))
            .join(' e ')}.`,
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
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 relative">
          <div className="max-w-5xl">
            {/* Breadcrumb mono */}
            <nav
              aria-label="Breadcrumb"
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 mb-8 inline-flex items-center gap-2"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Início
              </Link>
              <span className="text-white/30">/</span>
              <Link href="/faculdades" className="hover:text-white transition-colors">
                Faculdades
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white">{institution.name}</span>
            </nav>

            {/* Logo + Title */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 mb-6">
              <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
                <Image
                  src={institution.logoUrl}
                  alt={institution.imageAlt || `Logo ${institution.name}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<span class="text-3xl font-display font-semibold text-bolsa-primary flex items-center justify-center w-full h-full">${institution.shortName.charAt(0)}</span>`
                    }
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-white/30" />
                  Faculdade parceira
                </span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] font-semibold text-white leading-[1.05]">
                  Faculdade <span className="italic text-white/85">{institution.name}</span>
                </h1>
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/60 mt-4">
                  {typeLabels[institution.type]}
                  {institution.founded ? ` · Desde ${institution.founded}` : ''}
                  {yearsActive ? ` · ${yearsActive} anos` : ''}
                </p>
              </div>
            </div>

            <p className="text-white/80 text-[15px] md:text-[17px] leading-relaxed max-w-3xl">
              {institution.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#ofertas"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[14px] shadow-lg shadow-bolsa-secondary/30"
              >
                Ver bolsas disponíveis
                <ArrowRight size={16} />
              </a>
              <Link
                href="/faculdades"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-[14px]"
              >
                <ArrowLeft size={14} />
                Outras faculdades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      {stats.length > 0 && (
        <section className="bg-white border-b border-hairline">
          <div className="container mx-auto px-4">
            <div
              className={`grid grid-cols-2 ${
                stats.length >= 4 ? 'md:grid-cols-4' : `md:grid-cols-${stats.length}`
              } divide-x divide-hairline`}
            >
              {stats.map((s) => (
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
      )}

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* MAIN */}
          <div className="lg:col-span-8 space-y-14 md:space-y-20">
            {/* SOBRE */}
            <section>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Sobre a instituição
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-6">
                O que é a <span className="italic text-ink-700">{institution.name}?</span>
              </h2>
              <div className="space-y-4 text-ink-700 text-[16px] leading-relaxed">
                {institution.longDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* POR QUE ESTUDAR */}
            <section>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Por que estudar aqui
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-6">
                Tradição, alcance{' '}
                <span className="italic text-ink-700">e bolsa garantida.</span>
              </h2>
              <div className="space-y-4 text-ink-700 text-[16px] leading-relaxed mb-8">
                <p>
                  A Faculdade {institution.name} é uma das principais instituições de ensino superior do Brasil
                  {yearsActive ? `, com mais de ${yearsActive} anos de história` : ''}.
                  {institution.studentCount ? ` Com mais de ${institution.studentCount} alunos,` : ''} se destaca pela qualidade de ensino
                  {institution.mecRating ? ` reconhecida pelo MEC com nota ${institution.mecRating}` : ''} e variedade de cursos.
                </p>
                <p>
                  Estudar aqui significa acesso a{' '}
                  {institution.modalities
                    .map((m) =>
                      m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'aulas presenciais' : 'formato semipresencial',
                    )
                    .join(', ')}
                  , escolhendo a modalidade que cabe na sua rotina.
                  {institution.campusCount
                    ? ` Mais de ${institution.campusCount} polos e campus espalhados pelo Brasil.`
                    : ''}
                </p>
                <p>
                  Pelo Bolsa Click você garante bolsa com até <strong>80% de desconto</strong> na {institution.name}.
                  Cadastro grátis, sem ENEM, sem prova.
                </p>
              </div>

              {/* DIFERENCIAIS */}
              {institution.highlights.length > 0 && (
                <ul className="space-y-3 hairline-t pt-6">
                  {institution.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-bolsa-secondary/10 text-bolsa-secondary">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                      </span>
                      <span className="text-ink-700 text-[15px] leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* MODALIDADES */}
            {institution.modalities.length > 0 && (
              <section>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ink-300" />
                  Modalidades disponíveis
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-8">
                  Estude do jeito{' '}
                  <span className="italic text-ink-700">que cabe em você.</span>
                </h2>
                <ol className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline">
                  {institution.modalities.map((mod, i) => {
                    const detail = modalityDetail[mod]
                    if (!detail) return null
                    return (
                      <li
                        key={mod}
                        className="px-2 md:px-6 py-8 md:py-10 border-b border-hairline md:border-r last:md:border-r-0"
                      >
                        <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-700 mb-5 block">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-2xl md:text-[26px] text-ink-900 leading-tight mb-3">
                          {modalityShortLabel[mod]}
                        </h3>
                        <p className="text-ink-500 leading-relaxed text-[14px]">
                          {detail.body(institution.name)}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}

            {/* OFERTAS */}
            <section id="ofertas" className="scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                    <span className="h-px w-8 bg-ink-300" />
                    Bolsas na {institution.name}
                  </span>
                  <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                    Cursos com bolsa garantida
                  </h2>
                  <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                    {institutionCourses.length}{' '}
                    {institutionCourses.length === 1 ? 'oferta' : 'ofertas'} encontradas. Inscrição
                    grátis.
                  </p>
                </div>
              </div>

              {/* Filtro de modalidade */}
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModality('')
                    setVisibleCount(6)
                  }}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                    selectedModality === ''
                      ? 'bg-ink-900 text-white'
                      : 'bg-white border border-hairline text-ink-700 hover:border-ink-300'
                  }`}
                >
                  Todas
                </button>
                {institution.modalities.map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => {
                      setSelectedModality(mod)
                      setVisibleCount(6)
                    }}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                      selectedModality === mod
                        ? 'bg-ink-900 text-white'
                        : 'bg-white border border-hairline text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    {modalityShortLabel[mod] || mod}
                  </button>
                ))}
              </div>

              {institutionCourses.length === 0 ? (
                <div className="bg-white border border-hairline rounded-2xl p-10 md:p-12 text-center">
                  <GraduationCap className="mx-auto text-ink-300 mb-4" size={36} />
                  <p className="text-ink-700 text-[15px] mb-4">
                    Nenhuma oferta encontrada
                    {selectedModality
                      ? ` em ${modalityShortLabel[selectedModality] || selectedModality}`
                      : ''}{' '}
                    pra essa instituição agora.
                  </p>
                  <Link
                    href="/curso/resultado?nivel=GRADUACAO"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white font-semibold rounded-full text-[13px] hover:bg-bolsa-secondary/90 transition-colors"
                  >
                    Ver todas as bolsas
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  <ul
                    key={`${selectedModality}-${visibleCount}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch stagger-rise"
                  >
                    {visibleCourses.map((course, index) => (
                      <li key={`${course.id}-${index}`} className="h-full">
                        <CourseCardNew
                          courseName={course.name || ''}
                          course={course}
                          viewMode="grid"
                        />
                      </li>
                    ))}
                  </ul>

                  {institutionCourses.length > visibleCount && (
                    <div className="text-center mt-8">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-hairline text-ink-900 font-semibold rounded-full text-[13px] hover:border-ink-300 hover:bg-white transition-colors"
                      >
                        Ver mais {institutionCourses.length - visibleCount}{' '}
                        {institutionCourses.length - visibleCount === 1 ? 'curso' : 'cursos'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* FAQ */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-5">
                  <div className="md:sticky md:top-28">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                      <span className="h-px w-8 bg-ink-300" />
                      FAQ
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-4">
                      Dúvidas sobre{' '}
                      <span className="italic text-ink-700">a {institution.name}?</span>
                    </h2>
                    <p className="text-ink-500 text-[15px] leading-relaxed">
                      Tira as principais aqui. Pra detalhes específicos, fala direto com a faculdade
                      no momento da inscrição.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-7">
                  <ul className="border-t border-hairline">
                    {faqItems.map((faq, idx) => {
                      const open = openFaqIdx === idx
                      return (
                        <li key={idx} className="border-b border-hairline">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(open ? null : idx)}
                            aria-expanded={open}
                            className="w-full flex items-start justify-between gap-6 py-5 text-left"
                          >
                            <span className="flex items-baseline gap-4 min-w-0">
                              <span className="font-mono num-tabular text-[11px] tracking-[0.2em] text-ink-500 pt-1">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="font-display text-lg md:text-xl text-ink-900 leading-snug">
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
                            <div className="pb-5 pl-10 pr-12">
                              <p className="text-ink-500 leading-relaxed text-[15px]">{faq.a}</p>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            {/* CTA sticky */}
            <div className="sticky top-24 space-y-6">
              <div className="bg-bolsa-primary text-white rounded-2xl p-6 md:p-7 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-bolsa-secondary/30 blur-3xl"
                />
                <div className="relative">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 mb-3 inline-block">
                    Pronto pra começar?
                  </span>
                  <h3 className="font-display text-2xl font-semibold mb-2 leading-tight">
                    Bolsa na <span className="italic text-white/85">{institution.name}</span>
                  </h3>
                  <p className="text-white/70 text-[13px] mb-5 leading-relaxed">
                    Encontre bolsas com até 95% de desconto. Cadastro grátis, sem ENEM.
                  </p>
                  <a
                    href="#ofertas"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[13px] hover:bg-bolsa-secondary/90 transition-colors"
                  >
                    Ver bolsas disponíveis
                    <ArrowRight size={14} />
                  </a>
                  <Link
                    href="/curso/resultado?nivel=GRADUACAO"
                    className="inline-flex items-center justify-center gap-2 w-full mt-2 px-5 py-3 border border-white/20 text-white font-semibold rounded-full text-[13px] hover:bg-white/10 transition-colors"
                  >
                    Buscar outros cursos
                  </Link>
                </div>
              </div>

              {/* Info compacta */}
              <div className="bg-white border border-hairline rounded-2xl p-5 md:p-6">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ink-300" />
                  Informações
                </span>
                <ul className="divide-y divide-hairline">
                  {institution.headquartersCity && institution.headquartersState && (
                    <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                      <MapPin size={14} className="text-bolsa-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                          Sede
                        </span>
                        {institution.headquartersCity} / {institution.headquartersState}
                      </div>
                    </li>
                  )}
                  {institution.founded && (
                    <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                      <Calendar size={14} className="text-bolsa-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                          Fundada
                        </span>
                        {institution.founded}
                        {yearsActive ? ` · ${yearsActive} anos` : ''}
                      </div>
                    </li>
                  )}
                  {institution.mecRating && (
                    <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                      <Star
                        size={14}
                        className="text-bolsa-secondary mt-0.5 flex-shrink-0"
                        fill="currentColor"
                      />
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                          Nota MEC
                        </span>
                        {institution.mecRating} / 5
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                    <Building2 size={14} className="text-bolsa-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                        Tipo
                      </span>
                      {typeLabels[institution.type]}
                    </div>
                  </li>
                  {institution.modalities.length > 0 && (
                    <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                      <GraduationCap
                        size={14}
                        className="text-bolsa-secondary mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                          Modalidades
                        </span>
                        {institution.modalities
                          .map((m) => modalityFullLabel[m] || m)
                          .join(' · ')}
                      </div>
                    </li>
                  )}
                  {institution.academicLevels.length > 0 && (
                    <li className="flex items-start gap-3 py-3 text-[13px] text-ink-700">
                      <BookOpen
                        size={14}
                        className="text-bolsa-secondary mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-500">
                          Níveis
                        </span>
                        {institution.academicLevels
                          .map((l) => levelLabels[l] || l)
                          .join(' · ')}
                      </div>
                    </li>
                  )}
                </ul>

                {institution.emecLink && (
                  <a
                    href={institution.emecLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 text-[12px] font-mono tracking-wider uppercase text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Consultar no e-MEC
                  </a>
                )}
              </div>

              {/* Faculdades */}
              <Link
                href="/faculdades"
                className="card-lift block bg-white border border-hairline rounded-2xl p-5 hover:border-ink-300"
              >
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-2">
                  <Users size={11} />
                  Outras faculdades
                </span>
                <p className="font-display text-[17px] text-ink-900 leading-snug">
                  Veja todas as <span className="italic text-ink-700">faculdades parceiras</span>
                </p>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-bolsa-secondary mt-3">
                  Explorar
                  <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
