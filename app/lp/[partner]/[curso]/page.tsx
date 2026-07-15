import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2, ShieldCheck, Clock, Star } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import { getInstitutionCourses } from '@/app/lib/api/get-institution-courses'
import { BRAND_CONTENT } from '@/app/faculdades/[slug]/_data/brand-content'
import { LeadForm } from '../_components/LeadForm'
import { isPartner, brandColorFor } from '../../_shared/partners'

export const revalidate = 3600

// Landings de CURSO por parceiro (mídia paga): ingressa.digital/{parceiro}/{curso}.
// O middleware reescreve pra /lp/{parceiro}/{curso}. Cobre TODOS os cursos do
// catálogo (FeaturedCourse) por parceiro — geração dinâmica sob demanda (são
// noindex, o tráfego vem de anúncio, não de crawl).

type Props = { params: Promise<{ partner: string; curso: string }> }

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getInstitution = (slug: string) => prisma.institution.findUnique({ where: { slug } })

const getCourse = (slug: string) =>
  prisma.featuredCourse.findFirst({
    where: { slug, isActive: true },
    select: { name: true, fullName: true, apiCourseName: true },
  })

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Menor mensalidade da oferta do parceiro pro curso alvo (0 = sem preço). */
function partnerCoursePrice(courses: { name?: string; minPrice?: number }[], apiCourseName: string): number {
  const target = normalize(apiCourseName)
  const matches = courses.filter((c) => {
    const n = normalize(String(c.name ?? ''))
    return n === target || n.startsWith(`${target} `) || n.startsWith(`${target}-`) || n.includes(target)
  })
  const prices = matches.map((c) => Number(c.minPrice ?? 0)).filter((p) => p > 0)
  return prices.length ? Math.min(...prices) : 0
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { partner, curso } = await params
  const [inst, course] = await Promise.all([getInstitution(partner), getCourse(curso)])
  if (!inst || !course) return { title: 'Página não encontrada', robots: { index: false, follow: false } }
  return {
    title: `Bolsa em ${course.name} na ${inst.name} — até 80% de desconto`,
    description: `Garanta sua bolsa em ${course.name} na ${inst.fullName} com até 80% de desconto. Sem ENEM, sem nota de corte, inscrição grátis. Fale com nosso time.`,
    robots: { index: false, follow: false },
  }
}

export default async function PartnerCourseLanding({ params }: Props) {
  const { partner, curso } = await params
  if (!isPartner(partner)) notFound()

  const [inst, course] = await Promise.all([getInstitution(partner), getCourse(curso)])
  if (!inst || !inst.isActive || !course) notFound()

  const [offers, catalog] = await Promise.all([
    getInstitutionCourses(inst.name),
    prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const brandColor = brandColorFor(partner)
  const minPrice = partnerCoursePrice(offers, course.apiCourseName)
  const courseOptions = Array.from(new Set(catalog.map((c) => c.name.trim()).filter(Boolean)))
  // Garante que o curso da landing esteja no dropdown (pré-selecionado).
  if (!courseOptions.some((c) => normalize(c) === normalize(course.name))) {
    courseOptions.unshift(course.name)
  }

  const brand = BRAND_CONTENT[partner]
  const pontosFortes = brand?.valeAPena.pontosFortes ?? [
    'Diploma reconhecido pelo MEC',
    'Bolsas de até 80% sem nota de corte',
    'Inscrição gratuita e sem ENEM',
  ]

  return (
    <>
      {/* HERO + FORM */}
      <section className="relative overflow-hidden" style={{ backgroundColor: brandColor }}>
        <div aria-hidden className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 mb-6">
                {inst.logoUrl ? (
                  <Image
                    src={inst.logoUrl}
                    alt={`Logo ${inst.name}`}
                    width={120}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display font-semibold text-bolsa-primary text-lg">{inst.name}</span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.08] mb-4">
                Bolsa em <span className="underline decoration-white/40 decoration-[3px] underline-offset-4">{course.name}</span> na {inst.name}
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                Estude {course.name} na {inst.fullName} pagando muito menos. Bolsa de até 80%, sem ENEM,
                sem nota de corte, inscrição grátis. Preencha e nosso time garante sua vaga.
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-white/85 text-sm">
                {minPrice > 0 && (
                  <li className="inline-flex items-center gap-1.5">
                    <Star size={15} className="text-white/80" /> A partir de {formatBRL(minPrice)}/mês
                  </li>
                )}
                {inst.mecRating ? (
                  <li className="inline-flex items-center gap-1.5">
                    <Star size={15} className="text-white/80" /> Nota {inst.mecRating}/5 no MEC
                  </li>
                ) : (
                  <li className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-white/80" /> Reconhecida pelo MEC
                  </li>
                )}
                <li className="inline-flex items-center gap-1.5">
                  <Clock size={15} className="text-white/80" /> Resposta em minutos
                </li>
              </ul>
            </div>

            {/* Form */}
            <div className="lg:pl-6">
              <div className="mb-3 text-center">
                <span className="inline-block font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
                  Garanta sua bolsa em {course.name}
                </span>
              </div>
              <LeadForm
                partner={partner}
                partnerName={inst.name}
                courses={courseOptions}
                accentColor={brandColor}
                defaultCurso={course.name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE */}
      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-6">
            Por que estudar {course.name} na {inst.name}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {pontosFortes.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-ink-700 leading-relaxed">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: brandColor }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 md:py-16 text-center" style={{ backgroundColor: brandColor }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Sua bolsa em {course.name} está esperando
          </h2>
          <p className="text-white/80 mb-7">
            Preencha o formulário no topo e nosso time entra em contato pra garantir seu desconto de até 80%.
          </p>
          <a
            href="#top"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-white font-semibold rounded-full hover:opacity-90"
            style={{ color: brandColor }}
          >
            Quero minha bolsa
          </a>
        </div>
      </section>

      <footer className="bg-white py-6 border-t border-hairline">
        <div className="container mx-auto px-4 text-center text-[12px] text-ink-500">
          {inst.fullName} é instituição parceira. Intermediação de bolsas por Bolsa Click. Descontos
          e disponibilidade variam por curso, modalidade e unidade.
        </div>
      </footer>
    </>
  )
}
